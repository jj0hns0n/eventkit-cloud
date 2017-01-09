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
  #TODO: only run this if there are images
  #docker rmi -f \$(docker images | grep "eventkit" | awk "{print \\\$3}")
  docker images
  docker stop \$(docker ps -a -q)
  docker-compose --file docker-compose-test.yml build --no-cache --force-rm
  docker-compose --file docker-compose-test.yml up -d
  export HTTPD_IP=\$(docker-compose run httpd /sbin/ip -o -4 addr | awk '{print \$4}' | cut -d/ -f1 | tail -n 1)
  echo $HTTPD_ID
  docker-compose --file docker-compose-test.yml run --rm -e SITE_NAME='cloud.eventkit.dev' -e SITE_IP=\$HTTPD_IP -e DATABASE_URL=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  docker-compose --file docker-compose-test.yml ps
  docker-compose --file docker-compose-test.yml run --rm --user=root -e DATABASE_URl=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports -e DEBUG=True -e DEVELOPMENT=True -e SITE_NAME='cloud.eventkit.dev' -e SITE_IP=\$HTTPD_IP --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/integration-test-entrypoint.sh
  """
}
