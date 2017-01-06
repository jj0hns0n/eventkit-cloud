node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "$HOME"
  source ~/bin/activate
  pip install docker-compose
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker images
  docker rmi -f \$(docker images | grep "eventkit" | awk "{print \\\$3}")
  docker images
  docker-compose --file docker-compose-test.yml build --no-cache --force-rm
  docker-compose --file docker-compose-test.yml up -d
  docker-compose --file docker-compose-test.yml run --rm -e DATABASE_URl=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  docker-compose --file docker-compose-test.yml ps
  export HTTPD_IP=\$(/sbin/ip -o -4 addr list eth0 | awk '{print \$4}' | cut -d/ -f1)
  docker-compose --file docker-compose-test.yml run --rm --user=root -e DATABASE_URl=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True -e SITE_NAME='cloud.eventkit.dev' SITE_IP=\$HTTPD_IP --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/integration-test-entrypoint.sh
  """
}
