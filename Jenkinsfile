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
  docker-compose --file docker-compose-test.yml run --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/cat" eventkit /var/lib/eventkit/ls.out
  docker-compose --file docker-compose-test.yml run --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  """
}
