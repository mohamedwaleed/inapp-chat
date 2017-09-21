'use strict';

var elasticsearch = require('elasticsearch');
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];

class ElasticsearchService {

    constructor() {

      if(config.elastic_seacrh_url){
        this.elasticClient = new elasticsearch.Client({
            host: process.env[config.elastic_seacrh_url],
            log: 'info'
        });
        this.indexName = process.env[config.elastic_seacrh_index] || config.elastic_seacrh_index ||  "chatindex";

      }else {
        this.elasticClient = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'info'
        });
        this.indexName = "chatindex";
      }




        this.indexExists().then((exists) => {
          if (!exists) {
            this.initIndex().then(this.initMapping);
          }
        }).catch((err)=>{
          console.log(err);
        });

    }


    deleteIndex() {
        return this.elasticClient.indices.delete({
            index: this.indexName
        });
    }

    initIndex() {
        return this.elasticClient.indices.create({
            index: this.indexName
        });
    }

    indexExists() {
        return this.elasticClient.indices.exists({
            index: this.indexName
        });
    }

    initMapping() {
        return this.elasticClient.indices.putMapping({
            index: this.indexName,
            type: "document",
            body: {
                properties: {
                    chat_id: { type: "integer" },
                    content: { type: "string" },
                    suggest: {
                        type: "completion",
                        analyzer: "simple",
                        search_analyzer: "simple",
                        payloads: true
                    }
                }
            }
        });
    }

    addDocument(document) {
        return this.elasticClient.index({
            index: this.indexName,
            type: "document",
            body: {
                chat_id: document.chat_id,
                content: document.content,
                suggest: {
                    input: document.content.split(" "),
                    output: document.content,
                    payload:  {message: document}
                }
            }
        });
    }

    searchDocument(document) {
        return this.elasticClient.search({
          index: this.indexName,
          type: 'document',
          body: {
          "query": {
              "bool": {
                "must": [
                  { "match": { "content": document.content }},
                  { "match": { "chat_id": document.chat_id   }}
                ]
              }
            }
          }
        });
    }
}

var elasticsearchService = null;
function elasticsearchServiceFactory() {
    if(!elasticsearchService){
        elasticsearchService = new ElasticsearchService();
    }
    return elasticsearchService;
}

module.exports = elasticsearchServiceFactory();
