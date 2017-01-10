node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "$HOME"
  source ~/bin/activate
  pip install docker-compose
  export DATABASE_URL=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports
  export BROKER_URL=amqp://guest:guest@rabbitmq:5672/
  export DEBUG=True
  export PRODUCTION=True
  export EXPORT_DOWNLOAD_ROOT=/var/lib/eventkit/exports_download
  export SITE_NAME="cloud.eventkit.dev"
  export SITE_IP=\$(/sbin/ip -o -4 addr | grep docker0 | awk '{print \$4}' | cut -d/ -f1 | head -n 1) 
  export POSTGRES_USER=eventkit
  export POSTGRES_PASSWORD=eventkit_exports
  export POSTGRES_DB=eventkit_exports
  docker-compose version
  docker --version
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker images
  #TODO: only run this if there are images
  #docker rmi -f \$(docker images | grep "eventkit" | awk "{print \\\$3}")
  docker images
  docker stop \$(docker ps -a -q)
  docker-compose -f docker-compose-test.yml build
  docker-compose -f docker-compose-test.yml up -d
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py test eventkit_cloud
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py migrate
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py loaddata providers
  docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py run_integration_tests
  """
}
