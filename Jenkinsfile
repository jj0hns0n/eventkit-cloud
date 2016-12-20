node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "$HOME"
  source ~/bin/activate
  pip install docker-compose
  docker-compose down-
  docker-compose rm -f
  docker-compose build --file /var/lib/eventikt/docker-compose-test.yml --no-cache --force-rm
  docker-compose run --file /var/lib/eventikt/docker-compose-test.yml --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/cat" eventkit /var/lib/eventkit/ls.out
  docker-compose run --file /var/lib/eventikt/docker-compose-test.yml --rm -e DEBUG=True -e DEVELOPMENT=True --entrypoint "/bin/bash" eventkit /var/lib/eventkit/scripts/unit-test-entrypoint.sh
  docker-compose down
  """
}
