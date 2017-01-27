node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  /sbin/ip -o -4 addr  > /tmp/test-ip-addr
  cat /tmp/test-ip-addr
  pip install --user virtualenv --upgrade --force-reinstall
  ~/.local/bin/virtualenv --no-site-packages "\$HOME"
  . ~/bin/activate
  pip install docker-compose

  #TODO: only run this if there are images
  #XXX: we need this because the executors can run out of disk space, but
  #     it needs a tweak to not run when there aren't any eventkit images found
  #docker-compose --file docker-compose-test.yml down
  #docker rmi -f \$(docker images | awk "{print \\\$3}")

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
  docker-compose -f docker-compose-test.yml build

  # perform unit testing
  docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py test eventkit_cloud

  # perform integration testing
  #docker-compose -f docker-compose-test.yml up -d
  #docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py migrate
  #ss -an | grep 80
  #docker-compose ps
  #route
  #docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py run_integration_tests
  #docker-compose --file docker-compose-test.yml down
  #docker-compose --file docker-compose-test.yml rm -f
  """

  stage 'Deploy'
  withCredentials([
      [$class: 'StringBinding', credentialsId: 'test', variable: 'test']
  ]) {
    sh """
    set +x
    echo \$test
    echo \$PCF_API
    echo \$PCF_HOSTNAME
  } """
}
