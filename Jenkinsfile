node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user docker-compose
  ~/.local/bin/docker-compose
  """
}
