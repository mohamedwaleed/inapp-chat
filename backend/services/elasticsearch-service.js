var elasticsearch = require('elasticsearch');

class ElasticsearchService {

    constructor() {
        this.elasticClient = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'info'
        });

        this.indexName = "chatindex";

        this.indexExists().then((exists) => {
          if (!exists) {
            this.initIndex().then(this.initMapping);
          }
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





