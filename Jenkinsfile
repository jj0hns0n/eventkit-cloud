node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker pull docker/compose:1.8.0;
  docker run -v /var/run/docker.sock:/var/run/docker.sock -v "\$(pwd)":"\$(pwd)" --workdir="\$(pwd)" -e COMPOSE_PROJECT_NAME=\$(basename \$(pwd)) dduportal/docker-compose:latest build
  """
}
