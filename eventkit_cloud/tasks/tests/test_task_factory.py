# -*- coding: utf-8 -*-
import logging
import os
import uuid

from django.contrib.auth.models import Group, User
from django.contrib.gis.geos import GEOSGeometry, Polygon
from django.db import DatabaseError
from django.test import TestCase

from eventkit_cloud.jobs.models import Job, Region, ProviderTask, ExportProvider, License, UserLicense
from eventkit_cloud.tasks.models import ExportRun
from eventkit_cloud.tasks.task_factory import (TaskFactory, create_run, create_finalize_run_task_collection,
    get_invalid_licenses)
from mock import patch, Mock, MagicMock


logger = logging.getLogger(__name__)


class TestExportTaskFactory(TestCase):
    """
    Test cases for the TaskFactory.
    """

    fixtures = ('insert_provider_types.json', 'osm_provider.json',)

    def setUp(self,):
        self.path = os.path.dirname(os.path.realpath(__file__))
        Group.objects.create(name='TestDefaultExportExtentGroup')
        self.user = User.objects.create(username='demo', email='demo@demo.com', password='demo')
        bbox = Polygon.from_bbox((-10.85, 6.25, -10.62, 6.40))
        the_geom = GEOSGeometry(bbox, srid=4326)
        self.job = Job.objects.create(name='TestJob', description='Test description', user=self.user,
                                      the_geom=the_geom)
        provider = ExportProvider.objects.get(slug='osm')
        self.license = License.objects.create(slug='odbl-test', name='test_osm_license')
        provider.license = self.license
        provider.save()
        UserLicense.objects.create(license=self.license, user=self.user)
        provider_task = ProviderTask.objects.create(provider=provider)
        self.job.provider_tasks.add(provider_task)
        self.region = Region.objects.get(name='Africa')
        self.job.region = self.region
        self.uid = str(provider_task.uid)
        self.job.save()

    def test_create_run_success(self):
        run_uid = create_run(job_uid=self.job.uid)
        self.assertIsNotNone(run_uid)
        self.assertIsNotNone(ExportRun.objects.get(uid=run_uid))

    @patch('eventkit_cloud.tasks.task_factory.ExportRun')
    def test_create_run_failure(self, ExportRun):
        ExportRun.objects.create.side_effect = DatabaseError('FAIL')
        with self.assertRaises(DatabaseError):
            run_uid = create_run(job_uid=self.job.uid)
            self.assertIsNone(run_uid)

    @patch('eventkit_cloud.tasks.task_factory.get_invalid_licenses')
    @patch('eventkit_cloud.tasks.task_factory.finalize_export_provider_task')
    @patch('eventkit_cloud.tasks.task_factory.create_task')
    @patch('eventkit_cloud.tasks.task_factory.chain')
    def test_task_factory(self, task_factory_chain, create_task,
            finalize_task, mock_invalid_licenses):
        mock_invalid_licenses.return_value = []
        run_uid = create_run(job_uid=self.job.uid)
        self.assertIsNotNone(run_uid)
        self.assertIsNotNone(ExportRun.objects.get(uid=run_uid))
        worker = "some_worker"
        provider_uuid = uuid.uuid4()
        task_runner = MagicMock()
        task = Mock()
        task_runner().run_task.return_value = (provider_uuid, task)
        create_task.return_value = task
        task_factory = TaskFactory()
        task_factory.type_task_map = {'osm-generic': task_runner, 'osm': task_runner}
        task_factory.parse_tasks(run_uid=run_uid, worker=worker)
        task_factory_chain.assert_called()
        create_task.assert_called()
        finalize_task.s.assert_called()

        # Test that run is prevented and deleted if the user has not agreed to the licenses.
        mock_invalid_licenses.return_value = ['invalid-licenses']
        with self.assertRaises(Exception):
            task_factory.parse_tasks(run_uid=run_uid, worker=worker)
            run = ExportRun.objects.filter(uid=run_uid).first()
            self.assertIsNone(run)

    def test_get_invalid_licenses(self):
        # The license should not be returned if the user has agreed to it.
        expected_invalid_licenses = []
        invalid_licenses = get_invalid_licenses(self.job)
        self.assertEquals(invalid_licenses, expected_invalid_licenses)

        # A license should be returned if the user has not agreed to it.
        UserLicense.objects.get(license=self.license, user=self.user).delete()
        expected_invalid_licenses = [self.license.name]
        invalid_licenses = get_invalid_licenses(self.job)
        self.assertEquals(invalid_licenses, expected_invalid_licenses)

        UserLicense.objects.create(license=self.license, user=self.user)


class CreateFinalizeRunTaskCollectionTests(TestCase):

    @patch('eventkit_cloud.tasks.task_factory.example_finalize_run_hook_task')
    @patch('eventkit_cloud.tasks.task_factory.prepare_for_export_zip_task')
    @patch('eventkit_cloud.tasks.task_factory.zip_file_task')
    @patch('eventkit_cloud.tasks.task_factory.finalize_run_task_as_errback')
    @patch('eventkit_cloud.tasks.task_factory.finalize_run_task')
    @patch('eventkit_cloud.tasks.task_factory.chain')
    def test_create_finalize_run_task_collection(
            self, chain, finalize_run_task, finalize_run_task_as_errback, zip_file_task, prepare_for_export_zip_task, example_finalize_run_hook_task):
        """ Checks that all of the expected tasks were prepared and combined in a chain for return.
        """
        chain.return_value = 'When not mocked, this would be a celery chain'
        # None of these need correspond to real things, they're just to check the inner calls.
        run_uid = 1
        run_dir = 'test_dir'
        worker = 'test_worker'
        expected_task_settings = {
            'interval': 1, 'max_retries': 10, 'queue': worker, 'routing_key': worker, 'priority': 70}

        # This should return a chain of tasks ending in the finalize_run_task, plus a task sig for just the
        #    finalize_run_task.
        finalize_chain, errback = create_finalize_run_task_collection(run_uid=run_uid, run_dir=run_dir, worker=worker)

        example_finalize_run_hook_task.si.assert_called_once_with([], run_uid=run_uid)
        example_finalize_run_hook_task.si.return_value.set.assert_called_once_with(**expected_task_settings)

        prepare_for_export_zip_task.s.assert_called_once_with(run_uid=run_uid)
        prepare_for_export_zip_task.s.return_value.set.assert_called_once_with(**expected_task_settings)

        zip_file_task.s.assert_called_once_with(run_uid=run_uid)
        zip_file_task.s.return_value.set.assert_called_once_with(**expected_task_settings)

        finalize_run_task.si.assert_called_once_with(run_uid=run_uid, stage_dir=run_dir)
        finalize_run_task.si.return_value.set.assert_called_once_with(**expected_task_settings)

        self.assertEqual(finalize_chain, 'When not mocked, this would be a celery chain')
        self.assertEqual(errback, finalize_run_task_as_errback.si())
        self.assertEqual(chain.call_count, 1)

        # Grab the args for the first (only) call
        chain_inputs = chain.call_args[0]
        # The result of setting the args & settings for each task,
        # which unmocked would be a task signature, should be passed to celery.chain
        expected_chain_inputs = (
            example_finalize_run_hook_task.si.return_value.set.return_value,
            prepare_for_export_zip_task.s.return_value.set.return_value,
            zip_file_task.s.return_value.set.return_value,
            finalize_run_task.si.return_value.set.return_value,
        )
        self.assertEqual(chain_inputs, expected_chain_inputs)
