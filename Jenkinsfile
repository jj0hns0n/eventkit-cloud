node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker pull docker/compose:1.8.0;
  docker run docker/compose:1.8.0 build .
  """
}
