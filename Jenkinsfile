node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user docker-compose
  $HOME/.local/bin/docker-compose --help
  """
}
