node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  curl -L 'https://github.com/docker/compose/releases/download/1.9.0/run.sh' > run.sh; chmod +x run.sh;
  ./run.sh build;
  """
}
