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
  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker-compose --file docker-compose-test.yml build --no-cache --force-rm
  docker-compose --file docker-compose-test.yml run --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  docker-compose --file docker-compose-test.yml up -d
  docker-compose --file docker-compose-test.yml run --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/integration-test-entrypoint.sh
  docker-compose down
  docker-compose --file docker-compose-test.yml rm -f
  """
}
