#!/bin/sh

for i in "$@"
do
  echo Argument: $i
done
# exec "$1" "$2"
# Execute all other commands with paramters
exec "$@"
#exec "/usr/sbin/nginx"