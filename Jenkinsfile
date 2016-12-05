node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages "$HOME"
  source ~/bin/activate
  pip install docker-compose
  docker-compose down
  docker-compose rm
  docker-compose build
  docker-compose run eventkit "sh /var/lib/eventkit/scripts/unit-test-entrypoint.sh"
  """
}
