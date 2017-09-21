FROM node
ENV DATABASE_CONNECTION_URL ""
ENV ELASTIC_SEARCH_URL ""
ENV ELASTIC_SEARCH_INDEX ""
ENV NODE_ENV "production"
RUN mkdir /home/backend
COPY backend /home/backend
COPY start.sh /home
WORKDIR /home/backend
RUN chmod 777 -R /home/backend \
	&& chmod 777  /home/start.sh \
	&& apt-get update \
	&& apt-get install -y mysql-client
EXPOSE 3000
ENTRYPOINT ["/home/start.sh"]