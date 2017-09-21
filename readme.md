# inapp-chat
It is a node js chat server application for establishing a chat between developers and applications`s clients

# How it works

  - A developer establish a new chat with the client
  - A client must be registered on the application
  - A developer must include the chat-sdk on his/her application in order to automaticly register the user on the chat server.
  - the chat sdk automaticly inject a new html button in the bottom right of the page called chat that enables the user to press on it and start repling to developers that send messages.

# Project structure
  - chat backend (chat server)
  - small client (small client that include chat sdk to test it in real example)
  - Dockerfile (for building an image for chat backend)
  - docker-compose.yml (building and running all services together (chat backend, mysql, elasticsearch, small client))

# Installation
    # Manual run
    1- prerequisite: nodejs >= (8.4.0), npm, nginx or apache , elasticsearch, mysql
    2- cd backend
    3- npm install
    4- create database called chat (or whatever you want)
    5- modify backend/config/config.json to point to your connection urls (mysql, database name, elasticsearch url)
    6- $ node_modules/.bin/sequelize db:migrate
    7- $ node_modules/.bin/sequelize db:seed:all 
    8- $ npm start
    9- move small-client to /var/www/html in case of linux os
    10- from your browser navigate to http://localhost/small-client/client.html
    11- using any http client make request to ( http://localhost:3000/chat/1/message?from=1&to=1&content=hi there ) (this will send a message from developer number 1 to client number 1)
    
    #run using docker
    1- prerequisite: docker, docker-compose
    2- run the following command -> docker-compose up
    3- make sure that the ports 3000, 9200, 9300, 8080 is free to use or you can modify docker compose file to expose different ports
    
To switch between environment just put environment variable :
```sh
$ NODE_ENV=production
or
$ NODE_ENV=development
or
$ NODE_ENV=test
```
If you set the NODE_ENV to production you must set these environment variables to your values
```sh
$ DATABASE_CONNECTION_URL ""
$ ELASTIC_SEARCH_URL ""
$ ELASTIC_SEARCH_INDEX ""
```
# Api documnetation 
   - The project uses swagger to document the rest api
   - To see api documetation in visual mode from you browser navigate to ( http://localhost:3000/api-docs )
   - If you changed the application running port (change the port in the following file backen/public/api-docs/index.html in line 77)
   - or you can get the api specs from swagger yaml file in the following directory (backend/public/chat.yml)

License
----

Mohamed Waleed