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
  pip install docker-compose fabric

  #TODO: only run this if there are images
  #XXX: we need this because the executors can run out of disk space, but
  #     it needs a tweak to not run when there aren't any eventkit images found
  docker-compose --file docker-compose-test.yml down
  #docker rmi -f \$(docker images | awk "{print \\\$3}")
  #docker rmi -f \$(docker images | grep eventkit | tr -s \' \' | cut -f 3 -d " " | uniq)

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
  docker-compose -f docker-compose-test.yml build --no-cache

  # perform unit testing
  docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py test eventkit_cloud

  # perform integration testing
  #docker-compose -f docker-compose-test.yml up -d
  #docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py migrate
  #ss -an | grep 80
  #docker-compose ps
  #route
  #docker-compose --file docker-compose-test.yml down
  #docker-compose --file docker-compose-test.yml rm -f
  """

  stage 'Deploy'
  withCredentials([
      [$class: 'FileBinding', credentialsId: 'MANIFEST_YML', variable: 'MANIFEST_YML_PATH'],
      [$class: 'FileBinding', credentialsId: 'EC2_PEM', variable: 'EC2_PEM'],
      [$class: 'StringBinding', credentialsId: 'EC2_USERNAME', variable: 'EC2_USERNAME'],
      [$class: 'StringBinding', credentialsId: 'EC2_HOSTNAME', variable: 'EC2_HOSTNAME'],
      [$class: 'UsernamePasswordMultiBinding', credentialsId: 'PCF_PASSWORD', usernameVariable: 'PCF_USER', passwordVariable: 'PCF_PASSWORD'],
      [$class: 'StringBinding', credentialsId: 'PCF_API', variable: 'PCF_API'],
      [$class: 'StringBinding', credentialsId: 'PCF_APP', variable: 'PCF_APP'],
      [$class: 'StringBinding', credentialsId: 'PCF_DOMAIN', variable: 'PCF_DOMAIN'],
      [$class: 'StringBinding', credentialsId: 'PCF_ORG', variable: 'PCF_ORG'],
      [$class: 'StringBinding', credentialsId: 'PCF_SPACE', variable: 'PCF_SPACE'],
      [$class: 'StringBinding', credentialsId: 'PCF_HOSTNAME', variable: 'PCF_HOSTNAME'],
      [$class: 'StringBinding', credentialsId: 'SITE_NAME', variable: 'SITE_NAME'],
      [$class: 'UsernamePasswordMultiBinding', credentialsId: 'EVENTKIT_PASSWORD', usernameVariable: 'EVENTKIT_USER', passwordVariable: 'EVENTKIT_PASSWORD'],
  ]) {
    sh """
    ./scripts/jenkins-deploy.sh
  """
  }
}
