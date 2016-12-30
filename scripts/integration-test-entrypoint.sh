#!/bin/bash
cd /var/lib/eventkit
source /var/lib/eventkit/.virtualenvs/eventkit/bin/activate

unset PRODUCTION
export SITE_NAME='cloud.eventkit.dev'
export DATABASE_URL=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports
export BROKER_URL=amqp://guest:guest@rabbitmq:5672/
export C_FORCE_ROOT=True
export EXPORT_DOWNLOAD_ROOT=/var/lib/eventkit/exports_download
export WORKON_HOME=/var/lib/eventkit/.virtualenvs
export PROJECT_HOME=/var/lib/eventkit

/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py collectstatic --noinput
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py makemigrations
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py migrate
#/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/admin_user.json
#/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/insert_provider_types.json
#/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/osm_provider.json

/var/lib/eventkit/.virtualenvs/eventkit/bin/python manage.py run_integration_tests
