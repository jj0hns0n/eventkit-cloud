node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "$HOME"
  source ~/bin/activate
  pip install docker-compose
  docker images
  docker rmi -f \$(docker images | grep "<none>" | awk "{print \\\$3}")
  docker images
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker-compose --file docker-compose-test.yml build --no-cache --force-rm
  docker-compose --file docker-compose-test.yml run --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/ls" eventkit -l /var/lib/eventkit
  """
}
