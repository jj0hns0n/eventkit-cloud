node {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  docker run --add-host=docker:\$(ip route | awk '/docker0/ { print \$NF }') -v /var/run/docker.sock:/var/run/docker.sock -e SITE_NAME="cloud.eventkit.dev" -e DEBUG="True" -e DEVELOPMENT="True" -e SITE_IP="192.168.99.130" -v "\$(pwd)":"\$(pwd)" --workdir="\$(pwd)" -e COMPOSE_PROJECT_NAME="eventkit-cloud" dduportal/docker-compose:latest --verbose up
  """
}
