#!/bin/bash
cd /var/lib/eventkit
source /var/lib/eventkit/.virtualenvs/eventkit/bin/activate

unset PRODUCTION
export WORKON_HOME=/var/lib/eventkit/.virtualenvs
export PROJECT_HOME=/var/lib/eventkit

env
ls 
ls eventkit_cloud 
ls eventkit_cloud/settings/

/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py collectstatic --noinput
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py migrate
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/admin_user.json
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/insert_provider_types.json
/var/lib/eventkit/.virtualenvs/eventkit/bin/python /var/lib/eventkit/manage.py loaddata /var/lib/eventkit/eventkit_cloud/fixtures/osm_provider.json

#chown -R eventkit:eventkit /var/log/eventkit /var/lib/eventkit
/var/lib/eventkit/.virtualenvs/eventkit/bin/python manage.py test eventkit/
