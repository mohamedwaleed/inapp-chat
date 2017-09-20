#!/bin/bash
cd /home/backend

# set -e

# # host="$1"
# # shift
# # cmd="$@"
# while ! mysqladmin ping -h"$host" --silent; do
# 	>&2 echo "Mysql is unavailable - sleeping"
#     sleep 1
# done

# >&2 echo "Mysql is up"

echo "waiting mysql and elasticsearch to load"
sleep 15
echo "start migrating data"
node_modules/.bin/sequelize db:migrate
node_modules/.bin/sequelize db:seed:all
npm start