# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import shutil
import uuid
import os

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_delete, post_delete
from django.dispatch.dispatcher import receiver
from django.utils import timezone

from ..jobs.models import Job, ExportProvider, LowerCaseCharField
from ..utils.s3 import delete_from_s3
from ..tasks.export_tasks import TaskStates

logger = logging.getLogger(__name__)


class TimeStampedModelMixin(models.Model):
    """
    Mixin for timestamped models.
    """
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    started_at = models.DateTimeField(default=timezone.now, editable=False)
    finished_at = models.DateTimeField(editable=False, null=True)

    class Meta:
        abstract = True


class RunModelMixin(TimeStampedModelMixin):
    """
    Mixin for task runs.
    """
    id = models.AutoField(primary_key=True, editable=False)
    uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class ExportRun(RunModelMixin):
    """
    ExportRun is the main structure for storing export information.

    A Job provides information for the ExportRun.
    Many ExportRuns can map to a Job.
    Many ExportProviderTasks can map to an ExportRun.
    Many ExportTasks can map to an ExportProviderTask.
    """
    job = models.ForeignKey(Job, related_name='runs')
    user = models.ForeignKey(User, related_name="runs", default=0)
    worker = models.CharField(max_length=50, editable=False, default='', null=True)
    zipfile_url = models.CharField(max_length=1000, db_index=False, blank=True, null=True)
    status = models.CharField(
        blank=True,
        max_length=20,
        db_index=True,
        default=''
    )
    expiration = models.DateTimeField(default=timezone.now, editable=True)
    notified = models.DateTimeField(default=None, blank=True, null=True)
    deleted = models.BooleanField(default=False)
    delete_user = models.ForeignKey(User, null=True, blank=True, editable=False)

    class Meta:
        managed = True
        db_table = 'export_runs'

    def __str__(self):
        return '{0}'.format(self.uid)

    def soft_delete(self, user=None, *args, **kwargs):
        from .export_tasks import cancel_run
        exportrun_delete_exports(self.__class__, self)
        self.delete_user = user
        self.deleted = True
        logger.info("Deleting run {0} by user {1}".format(self.uid, user))
        cancel_run.run(export_run_uid=self.uid, canceling_user=user, delete=True)
        self.save()


class ExportProviderTask(models.Model):
    """
    The ExportProviderTask stores the task information for a specific provider.
    """
    id = models.AutoField(primary_key=True, editable=False)
    uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, blank=True)
    slug = LowerCaseCharField(max_length=40, default='')
    run = models.ForeignKey(ExportRun, related_name='provider_tasks')
    status = models.CharField(blank=True, max_length=20, db_index=True)
    display = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']
        managed = True
        db_table = 'export_provider_tasks'

    def __str__(self):
        return 'ExportProviderTask uid: {0}'.format(self.uid)


class ExportTask(models.Model):
    """
     An ExportTask holds the information about the process doing the actual work for a task.
    """
    id = models.AutoField(primary_key=True, editable=False)
    uid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    celery_uid = models.UUIDField(null=True)  # celery task uid
    name = models.CharField(max_length=50)
    export_provider_task = models.ForeignKey(ExportProviderTask, related_name='tasks')
    status = models.CharField(blank=True, max_length=20, db_index=True)
    progress = models.IntegerField(default=0, editable=False, null=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    started_at = models.DateTimeField(editable=False, null=True)
    estimated_finish = models.DateTimeField(blank=True, editable=False, null=True)
    finished_at = models.DateTimeField(editable=False, null=True)
    pid = models.IntegerField(blank=True, default=-1)
    worker = models.CharField(max_length=100, blank=True, editable=False, null=True)
    cancel_user = models.ForeignKey(User, null=True, blank=True, editable=False)
    display = models.BooleanField(default=False)
    result = models.OneToOneField('FileProducingTaskResult', null=True, blank=True, related_name='export_task')

    class Meta:
        ordering = ['created_at']
        managed = True
        db_table = 'export_tasks'

    def __str__(self):
        return 'ExportTask uid: {0}'.format(self.uid)


class FinalizeRunHookTaskRecord(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    run = models.ForeignKey(ExportRun)
    celery_uid = models.UUIDField()
    task_name = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    started_at = models.DateTimeField(editable=False, null=True)
    finished_at = models.DateTimeField(editable=False, null=True)
    status = models.CharField(blank=True, max_length=20, db_index=True)
    pid = models.IntegerField(blank=True, default=-1)
    worker = models.CharField(max_length=100, blank=True, editable=False, null=True)
    cancel_user = models.ForeignKey(User, null=True, blank=True, editable=False)
    result = models.OneToOneField('FileProducingTaskResult', null=True, blank=True, related_name='finalize_task')

    class Meta:
        ordering = ['created_at']
        managed = True
        db_table = 'finalize_run_hook_task_record'

    def __str__(self):
        return 'RunFinishedTaskRecord ({}): {}'.format(self.celery_uid, self.status)


class FileProducingTaskResult(models.Model):
    """
         A FileProducingTaskResult holds the information from the task, i.e. the reason for executing the task.
    """
    id = models.AutoField(primary_key=True)
    filename = models.CharField(max_length=100, blank=True, editable=False)
    size = models.FloatField(null=True, editable=False)
    download_url = models.URLField(
        verbose_name='URL to export task result output.',
        max_length=254
    )
    deleted = models.BooleanField(default=False)

    @property
    def task(self):
        if hasattr(self, 'finalize_task') and hasattr(self.export_task):
            raise Exception('Both an ExportTask and a FinalizeRunHookTaskRecord are linked to FileProducingTaskResult')
        elif hasattr(self, 'finalize_task'):
            ret = self.finalize_task
        elif hasattr(self, 'export_task'):
            ret = self.export_task
        else:
            ret = None
        return ret

    def soft_delete(self, *args, **kwargs):
        exporttaskresult_delete_exports(self.__class__, self)
        self.deleted = True
        self.save()
        if hasattr(self.task, 'display'):
            self.task.display = False
            self.task.save()

    class Meta:
        managed = True
        db_table = 'export_task_results'

    def __str__(self):
        return 'FileProducingTaskResult ({}), {}'.format(self.id, self.filename)


class ExportTaskException(models.Model):
    """
    Model to store ExportTask exceptions for auditing.
    """
    id = models.AutoField(primary_key=True, editable=False)
    task = models.ForeignKey(ExportTask, related_name='exceptions')
    timestamp = models.DateTimeField(default=timezone.now, editable=False)
    exception = models.TextField(editable=False)

    class Meta:
        managed = True
        db_table = 'export_task_exceptions'


@receiver(pre_delete, sender=ExportRun)
def exportrun_delete_exports(sender, instance, *args, **kwargs):
    """
    Delete the associated export files when an ExportRun is deleted.
    """
    if getattr(settings, 'USE_S3', False):
        delete_from_s3(run_uid=str(instance.uid))
    run_dir = '{0}/{1}'.format(settings.EXPORT_DOWNLOAD_ROOT.rstrip('/'), instance.uid)
    try:
        shutil.rmtree(run_dir, ignore_errors=True)
        logger.info("The directory {0} was deleted.".format(run_dir))
    except OSError as os_error:
        logger.warn("The directory {0} was already moved or doesn't exist.".format(run_dir))


@receiver(pre_delete, sender=FileProducingTaskResult)
def exporttaskresult_delete_exports(sender, instance, *args, **kwargs):
    """
    Delete associated files when deleting the FileProducingTaskResult.
    """
    # The url should be constructed as [download context, run_uid, filename]
    if getattr(settings, 'USE_S3', False):
        delete_from_s3(download_url=instance.download_url)
    url_parts = instance.download_url.split('/')
    full_file_download_path = '/'.join([settings.EXPORT_DOWNLOAD_ROOT.rstrip('/'), url_parts[-2], url_parts[-1]])
    try:
        os.remove(full_file_download_path)
        logger.info("The directory {0} was deleted.".format(full_file_download_path))
    except OSError:
        logger.warn("The file {0} was already removed or does not exist.".format(full_file_download_path))
