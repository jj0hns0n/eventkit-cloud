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
  docker-compose --file docker-compose-test.yml build
  docker-compose --file docker-compose-test.yml up -d
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py test eventkit_cloud
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py migrate
  docker-compose -f docker-compose-test.yml exec -T eventkit python manage.py loaddata providers
  SITE_NAME=cloud.eventkit.dev SITE_IP=\$(/sbin/ip -o -4 addr | grep docker0 | awk '{print \$4}' | cut -d/ -f1 | head -n 1) docker-compose -f docker-compose-test.yml run -T run --rm -e SITE_NAME='cloud.eventkit.dev' -e SITE_IP=\$HTTPD_IP eventkit python manage.py run_integration_tests
  """
}
