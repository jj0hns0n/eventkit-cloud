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
  docker rmi -f \$(docker images | grep "<none>" | awk "{print \\\$3}")
  docker rmi -f \$(docker images | grep "eventkit" | awk "{print \\\$3}")
  docker images
  docker-compose --file docker-compose-test.yml build --no-cache --force-rm
  docker-compose --file docker-compose-test.yml up -d
  docker-compose --file docker-compose-test.yml run --rm -e DATABASE_URl=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  docker-compose --file docker-compose-test.yml ps
  docker-compose --file docker-compose-test.yml run --rm --user=root -e DATABASE_URl=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True -e HTTPD_IP=\$(ifconfig eth0 | grep "inet addr" | cut -d ':' -f 2 | cut -d ' ' -f 1) docker-compose run eventkit /sbin/ip addr) --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/integration-test-entrypoint.sh
  """
}
