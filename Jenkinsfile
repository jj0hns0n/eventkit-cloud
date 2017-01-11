node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  /sbin/ip -o -4 addr  > /tmp/test-ip-addr
  cat /tmp/test-ip-addr
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "\$HOME"
  source ~/bin/activate
  pip install docker-compose
  #Added name for containers
  export COMPOSE_PROJECT_NAME=eventkit_cloud
  export DATABASE_URL=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports
  export BROKER_URL=amqp://guest:guest@rabbitmq:5672/
  export DEBUG=True
  export PRODUCTION=True
  export EXPORT_DOWNLOAD_ROOT=/var/lib/eventkit/exports_download
  export SITE_NAME="cloud.eventkit.dev"
  # Using eth0
  export SITE_IP=\$(/sbin/ip -o -4 addr list eth0 | awk '{print \$4}' | cut -d/ -f1) 
  export POSTGRES_USER=eventkit
  export POSTGRES_PASSWORD=eventkit_exports
  export POSTGRES_DB=eventkit_exports
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker images
  #TODO: only run this if there are images
  #docker rmi -f \$(docker images | grep "eventkit" | awk "{print \\\$3}")
  docker images
  docker stop \$(docker ps -a -q)
  docker-compose -f docker-compose-test.yml build
  docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py test eventkit_cloud
  docker-compose -f docker-compose-test.yml up -d
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py migrate
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py loaddata providers
  ss -an | grep 80
  docker-compose -f docker-compose-test.yml run -T --rm eventkit --entrypoint /bin/ping \$SITE_NAME
  docker-compose -f docker-compose-test.yml run -T --rm eventkit --entrypoint /bin/ping \$SITE_IP
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  """
}
