node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  curl -L 'https://raw.githubusercontent.com/docker/compose/master/script/run/run.sh' > run.sh; chmod +x run.sh;
  ./run.sh build;
  """
}
