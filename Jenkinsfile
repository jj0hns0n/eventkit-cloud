node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker rmi 785283cf3ffc
  """
}
