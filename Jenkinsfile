node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker rmi -f 785283cf3ffc
  """
}
