node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker pull docker/compose:1.8.0
  """
}
