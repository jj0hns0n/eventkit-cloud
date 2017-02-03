# -*- coding: utf-8 -*-
from __future__ import absolute_import

from celery.schedules import crontab

from .contrib import *  # NOQA
import os
import json
import socket

# Celery config
CELERY_TRACK_STARTED = True

"""
 IMPORTANT

 Don't propagate exceptions in the celery chord header to the finalize task.
 If exceptions are thrown in the chord header then allow the
 finalize task to collect the results and update the overall run state.

"""
CELERY_CHORD_PROPAGATES = False
CELERYD_PREFETCH_MULTIPLIER = 0
# CELERYBEAT_SCHEDULER='djcelery.schedulers.DatabaseScheduler'
CELERY_RESULT_BACKEND=os.environ.get('CELERY_RESULT_BACKEND', 'django-db')
# Chord_unlock is used by chained tasks.  By default it goes on the main queue, however for the
# tasks.export_tasks.shutdown_eventkit function to work, it needs to be routed to the worker queue.  This means that,
# chord unlocking won't work across nodes.
CELERY_ANNOTATIONS = {'celery.chord_unlock': {'queue': '{0}'.format(socket.gethostname())}}
# Pickle used to be the default, and accepting pickled content is a security concern.  Using the new default json,
# causes a circular reference error, that will need to be resolved.
CELERY_TASK_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
# configure periodic task
CELERYBEAT_SCHEDULE = {
    # 'purge-unpublished-exports': {
    #     'task': 'Purge Unpublished Exports',
    #     'schedule': crontab(minute='0', hour='*', day_of_week='*')
    # },
    'expire-runs': {
        'task': 'Expire Runs',
        'schedule': crontab(minute='0', hour='0', day_of_week='*')
    }
}


if os.environ.get('VCAP_SERVICES'):
    services = json.loads(os.environ.get('VCAP_SERVICES'))
    try:
        BROKER_URL = services['cloudamqp'][0]['credentials']['uri']
    except KeyError:
        BROKER_URL = os.environ.get('BROKER_URL', 'amqp://guest:guest@localhost:5672//')
else:
    BROKER_URL = os.environ.get('BROKER_URL', 'amqp://guest:guest@localhost:5672//')