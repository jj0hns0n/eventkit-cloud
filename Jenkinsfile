node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker pull docker/compose:1.8.0;
  docker run -v "\$(pwd)":/opt/eventkit-cloud docker/compose:1.8.0 --file /opt/eventkit-cloud/docker-compose.yml build
  """
}
