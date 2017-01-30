node('sl61') {
  stage 'Checkout'
  checkout scm

  stage 'Test'
  sh """
  /sbin/ip -o -4 addr  > /tmp/test-ip-addr
  cat /tmp/test-ip-addr
  pip install --user virtualenv --upgrade --force-reinstall
  ~/.local/bin/virtualenv --no-site-packages "\$HOME"
  . ~/bin/activate
  pip install docker-compose fabric

  #TODO: only run this if there are images
  #XXX: we need this because the executors can run out of disk space, but
  #     it needs a tweak to not run when there aren't any eventkit images found
  #docker-compose --file docker-compose-test.yml down
  #docker rmi -f \$(docker images | awk "{print \\\$3}")

  #Added name for containers
  export COMPOSE_PROJECT_NAME=eventkit_cloud
  export DATABASE_URL=postgis://eventkit:eventkit_exports@postgis:5432/eventkit_exports
  export BROKER_URL=amqp://guest:guest@rabbitmq:5672/
  export DEBUG=True
  export PRODUCTION=True
  export EXPORT_DOWNLOAD_ROOT=/var/lib/eventkit/exports_download
  export SITE_NAME="cloud.eventkit.dev"

  # Using eth0
  export SITE_IP=\$(/sbin/ip -o -4 addr list eth0 | awk '{print \$4}' | cut -d/ -f1) 
  export POSTGRES_USER=eventkit
  export POSTGRES_PASSWORD=eventkit_exports
  export POSTGRES_DB=eventkit_exports

  docker-compose --file docker-compose-test.yml down
  docker-compose --file docker-compose-test.yml rm -f
  docker-compose -f docker-compose-test.yml build

  # perform unit testing
  docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py test eventkit_cloud

  # perform integration testing
  #docker-compose -f docker-compose-test.yml up -d
  #docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py migrate
  #ss -an | grep 80
  #docker-compose ps
  #route
  #docker-compose -f docker-compose-test.yml run -T --rm eventkit python manage.py run_integration_tests
  #docker-compose --file docker-compose-test.yml down
  #docker-compose --file docker-compose-test.yml rm -f
  """

  stage 'Deploy'
  withCredentials([
      [$class: 'FileBinding', credentialsId: 'MANIFEST_YML', variable: 'MANIFEST_YML_PATH'],
      [$class: 'FileBinding', credentialsId: 'EC2_PEM', variable: 'EC2_PEM'],
      [$class: 'StringBinding', credentialsId: 'EC2_USERNAME', variable: 'EC2_USERNAME'],
      [$class: 'StringBinding', credentialsId: 'EC2_HOSTNAME', variable: 'EC2_HOSTNAME'],
      [$class: 'UsernamePasswordMultiBinding', credentialsId: 'PCF_PASSWORD', usernameVariable: 'PCF_USER', passwordVariable: 'PCF_PASSWORD'],
      [$class: 'StringBinding', credentialsId: 'PCF_API', variable: 'PCF_API'],
      [$class: 'StringBinding', credentialsId: 'PCF_APP', variable: 'PCF_APP'],
      [$class: 'StringBinding', credentialsId: 'PCF_DOMAIN', variable: 'PCF_DOMAIN'],
      [$class: 'StringBinding', credentialsId: 'PCF_ORG', variable: 'PCF_ORG'],
      [$class: 'StringBinding', credentialsId: 'PCF_SPACE', variable: 'PCF_SPACE'],
      [$class: 'StringBinding', credentialsId: 'PCF_HOSTNAME', variable: 'PCF_HOSTNAME']
  ]) {
    sh """
    set +x
    export APP=\$PCF_APP;
    export VERSION=\$BUILD_NUM

    pushd `dirname \$0` > /dev/null
    script_dir=\$(pwd -P)
    popd > /dev/null
    
    root=\$(pwd -P)
    
    type cf >/dev/null 2>&1 || { echo "\$0: cf cli not available" >&2; exit 1; }

    # _app_env start
    type git >/dev/null 2>&1 || { echo "\$0: git not available" >&2; exit 1; }
    
    root=\$(pwd -P)
    
    # ! test -f \$root/ci/vars.sh || source \$root/ci/vars.sh
    
    test -n "\$APP" || { echo "\$0: APP not defined." >&2; exit 1; }
    
    export VERSION=\$(git describe --long --tags --always)
    export PCF_HOSTNAME=\$(echo \$APP-\$VERSION | sed 's/\\./-/g')
    
    # _app_env end
    
    test -n "\$APP"           || { echo "\$0: APP not defined." >&2; exit 1; }
    test -n "\$VERSION"       || { echo "\$0: VERSION not defined." >&2; exit 1; }
    test -n "\$PCF_HOSTNAME"  || { echo "\$0: PCF_HOSTNAME not defined." >&2; exit 1; }
    test -n "\$MANIFEST_YML_PATH"  || { echo "\$0: MANIFEST_YML_PATH not defined." >&2; exit 1; }
    
    # Use space specific manifest if availablie
    export manifest="$MANIFEST_YML_PATH"
    echo "$MANIFEST_YML_PATH"
 
    set +x
    oldhistfile="\$HISTFILE"
    export HISTFILE=/dev/null
    [ -z "\$do_xtrace" ] || set -x

    # _cf_auth start 
    type cf >/dev/null 2>&1 || { echo "\$0: cf cli not available" >&2; exit 1; }
    
    root=\$(pwd -P)
    
    export CF_HOME=\$root
    
    do_xtrace=\$(echo \$SHELLOPTS | grep -o xtrace | cat)
    set +x
    oldhistfile="\$HISTFILE"
    export HISTFILE=/dev/null
    
    test -n "\$PCF_API"   || { echo "\$0: PCF_API not defined." >&2;   exit 1; }
    test -n "\$PCF_USER"  || { echo "\$0: PCF_USER not defined." >&2;  exit 1; }
    test -n "\$PCF_PASSWORD"  || { echo "\$0: PCF_PASSWORD not defined." >&2;  exit 1; }
    test -n "\$PCF_ORG"   || { echo "\$0: PCF_ORG not defined." >&2;   exit 1; }
    test -n "\$PCF_SPACE" || { echo "\$0: PCF_SPACE not defined." >&2; exit 1; }
    test -n "\$PCF_DOMAIN" || { echo "\$0: PCF_DOMAIN not defined." >&2; exit 1; }
    
    cf api \$PCF_API > /dev/null
    cf auth "\$PCF_USER" "\$PCF_PASSWORD" > /dev/null
    cf target -o \$PCF_ORG -s \$PCF_SPACE > /dev/null
    
    export HISTFILE="\$oldhistfile"
    [ -z "\$do_xtrace" ] || set -x
    # _cf_auth end

    set +x
    cf app \$APP-\$VERSION && { echo " \$APP-\$VERSION already running."; exit 0; } || echo "Pushing \$APP-\$VERSION."
    
    set +e
    
    cf push \$APP-\$VERSION -f "\$manifest" --hostname "\$PCF_HOSTNAME" -d "\$PCF_DOMAIN"
    
    push_status=\$?
    
    set -e
    
    if [ \$push_status != 0 ]; then
      echo "Printing log output as a result of the failure."
      cf logs --recent \$APP-\$VERSION
      cf delete \$APP-\$VERSION -f -r
    fi

    chmod 500 "\$EC2_PEM"
    ssh -i "\$EC2_PEM" \$EC2_USERNAME@\$EC2_HOSTNAME "echo 'test'"

    rm -f \$EC2_PEM
    
    export HISTFILE="\$oldhistfile"
    exit \$push_status
  """
  }
}
