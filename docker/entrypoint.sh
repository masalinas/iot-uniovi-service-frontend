#!/bin/sh

# The first parameter is the path to the file which should be substituted
if [[ -z $1 ]]; then
    echo 'ERROR: No target file given.'
    exit 1
fi

# The included envsubst command (not available in every docker container) will substitute the variables for us.
# They should have the format ${TEST_ENV} or $TEST_ENV
# For more information look up the command here: https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html
envsubst '\$BASE_PATH \$BROKER_PATH \$BROKER_DEVICE_TOPIC \$BROKER_FEEDBACK_TOPIC' < "$1" > "$1".tmp && mv "$1".tmp "$1"

# Set DEBUG=true in order to log the replaced file
if [ "$DEBUG" = true ] ; then
  exec cat $1
fi
# less $1 argument
shift 1
# Execute all other commands with paramters
exec "$@"
#exec "/usr/sbin/nginx"