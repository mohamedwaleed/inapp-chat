#!/bin/bash
cd /home/backend


echo "Waiting for mysql"
until mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -uroot -p"$MYSQL_ROOT_PASSWORD" &> /dev/null
do
  printf "."
  sleep 1
done

echo -e "\nmysql ready"

node_modules/.bin/sequelize db:migrate
node_modules/.bin/sequelize db:seed:all
npm start