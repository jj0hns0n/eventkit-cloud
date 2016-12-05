node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user docker-compose
  $HOME/.local/lib/python2.7/bin/docker-compose build
  """
}
