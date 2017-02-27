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
#export PCF_HOSTNAME=\$(echo \$APP-\$VERSION | sed 's/\\./-/g')

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

cf push \$APP -f "\$manifest" 
echo $PCF_HOSTNAME

push_status=\$?

set -e

if [ \$push_status != 0 ]; then
  echo "Printing log output as a result of the failure."
  cf logs --recent \$APP-\$VERSION
  cf delete \$APP-\$VERSION -f -r
fi

chmod 500 "\$EC2_PEM"
#ssh -o StrictHostKeyChecking=no -i "\$EC2_PEM" \$EC2_USERNAME@\$EC2_HOSTNAME "echo 'abcd'"
docker-compose run -e SSH_USER=\$EC2_USERNAME -e DATABASE_URL=\$DATABASE_URL -e EVENTKIT_CWD='/home/ubuntu/eventkit-cloud' -e EC2_HOSTNAME=\$EC2_HOSTNAME --entrypoint /var/lib/.virtualenvs/eventkit/bin/fab --user=root celery -i /opt/celery.pem -f fabfile.py deploy_ec2

rm -f \$EC2_PEM

docker-compose -f docker-compose-test.yml run -e SITE_NAME=\$SITE_NAME -e USERNAME=\$EVENTKIT_USER -e PASSWORD=$EVENTKIT_PASSWORD -T --rm eventkit python manage.py run_integration_tests

export HISTFILE="\$oldhistfile"
exit \$push_status
