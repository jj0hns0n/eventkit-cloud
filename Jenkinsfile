node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  pip install --user virtualenv
  ~/.local/bin/virtualenv --no-site-packages $HOME
  pip install docker-compose
  ~/.local/bin/docker-compose --help
  """
}
