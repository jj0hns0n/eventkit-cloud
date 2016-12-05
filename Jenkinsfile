node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install -U virtualenv
  cd ~
  virtualenv .
  pip install --user docker-compose
  docker-compose --help
  """
}
