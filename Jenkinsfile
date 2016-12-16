node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker rmi zrununittests_eventkit
  """
}
