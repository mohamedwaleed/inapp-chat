FROM node
ENV DATABASE_CONNECTION_URL ""
ENV ELASTIC_SEARCH_URL ""
ENV ELASTIC_SEARCH_INDEX ""
COPY backend /home
WORKDIR /home/backend
RUN npm install
RUN node_modules/.bin/sequelize db:seed:all
CMD ["npm","start"]