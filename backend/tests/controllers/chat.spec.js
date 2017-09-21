'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../app');
var sinon = require('sinon');
const db = require('../../models');
var should = chai.should();
var expect = chai.expect
var elasticSearch = require('../../services/elasticsearch-service');

chai.use(chaiHttp);


describe("Chat controller", function(){


    before(function(done) {
      var companyTablePromise =  db.sequelize.queryInterface.createTable('company',{
          id: {
            type: db.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
             type: db.Sequelize.STRING(50),
             allowNull: false
          }
      });
      var applicationTablePromise =  db.sequelize.queryInterface.createTable('application',{
          id: {
            type: db.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
             type: db.Sequelize.STRING(50),
             allowNull: false
          },
          company_id: {
            type:  db.Sequelize.INTEGER,
            references: {
              model: 'company',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
      });

      var developerTablePromise =   db.sequelize.queryInterface.createTable('developer',{
          id: {
            type: db.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          first_name: {
             type: db.Sequelize.STRING(50),
             allowNull: true
          },
          last_name: {
             type: db.Sequelize.STRING(50),
             allowNull: true
          },
          gender: {
              type: db.Sequelize.STRING,
              allowNull: false
          },
          email: {
              type: db.Sequelize.STRING(50),
              allowNull: true,
              unique: true
          },
          company_id: {
            type:  db.Sequelize.INTEGER,
            references: {
              model: 'company',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
      });
      var userTablePromise =  db.sequelize.queryInterface.createTable('user',{
          id: {
            type: db.Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          first_name: {
             type: db.Sequelize.STRING(50),
             allowNull: true
          },
          last_name: {
             type: db.Sequelize.STRING(50),
             allowNull: true
          },
          gender: {
             type: db.Sequelize.STRING,
             allowNull: true
          },
          age: {
             type: db.Sequelize.INTEGER,
             allowNull: true
          },
          email: {
             type: db.Sequelize.STRING(50),
             allowNull: true,
             unique: true
          },
          is_online: {
             type: db.Sequelize.BOOLEAN,
             defaultValue: false
          },
          application_id: {
            type:  db.Sequelize.INTEGER,
            references: {
              model: 'application',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
      });

      var chatTablePromise =  db.sequelize.queryInterface.createTable('chat',{
             id: {
                type: db.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
             },
             user_id: {
               type:  db.Sequelize.INTEGER,
               references: {
                 model: 'user',
                 key: 'id'
               },
               onUpdate: 'cascade',
               onDelete: 'cascade'
             },
             developer_id: {
               type:  db.Sequelize.INTEGER,
               references: {
                  model: 'developer',
                  key: 'id'
               },
               onUpdate: 'cascade',
               onDelete: 'cascade'
             }
         });
        var messageTablePromise =   db.sequelize.queryInterface.createTable('message',{
             id: {
               type: db.Sequelize.INTEGER,
               primaryKey: true,
               autoIncrement: true
             },
             content: {
                type: db.Sequelize.STRING(500),
                allowNull: true
             },
             is_client: {
                type: db.Sequelize.BOOLEAN,
                allowNull: true
             },
             chat_id: {
               type:  db.Sequelize.INTEGER,
               references: {
                 model: 'chat',
                 key: 'id'
               },
               onUpdate: 'cascade',
               onDelete: 'cascade'
             },
             attachment_id: {
                 type: db.Sequelize.INTEGER,
                 allowNull: true
             },
             created_at: {
                 type: db.Sequelize.DATE,
                 allowNull: false
             },
             updated_at: {
                 type: db.Sequelize.DATE,
                 allowNull: false
             }
         });

         var attchmentTablePromsie =  db.sequelize.queryInterface.createTable('attachment',{
             id: {
               type: db.Sequelize.INTEGER,
               primaryKey: true,
               autoIncrement: true
             },
             file_path: {
                type: db.Sequelize.STRING(500),
                allowNull: true
             }
           });


        companyTablePromise
          .then(applicationTablePromise)
          .then(developerTablePromise)
          .then(userTablePromise)
          .then(chatTablePromise)
          .then(messageTablePromise)
          .then(attchmentTablePromsie).then(()=>{
            done();
          });

    });

    after(function() {

    });

    beforeEach(function(done) {
      // var elasticSearchIndexPromise = elasticSearch.elasticClient.indices.exists({
      //       index: elasticSearch.indexName
      //   }).then((exists)=>{
      //     if(exists){
      //       console.log("--------------------------------------check");
      //       return elasticSearch.elasticClient.indices.delete({
      //           index: elasticSearch.indexName
      //       });
      //     }
      //   }).then(()=>{
      //     console.log("--------------------------------------creating");
      //     return elasticSearch.elasticClient.indices.create({
      //        index: elasticSearch.indexName
      //    });
      //  }).then(elasticSearch.elasticClient.initMapping).catch(function (err) {
      //     console.log(err);
      //   });

        // runs before each test in this block
        // var elasticSearchIndexPromise = elasticSearch.elasticClient.indices.delete({
        //     index: elasticSearch.indexName
        // }).then(()=>{
        //    return elasticSearch.elasticClient.indices.create({
        //       index: elasticSearch.indexName
        //   });
        // }).catch(()=>{
        //   return elasticSearch.elasticClient.indices.create({
        //      index: elasticSearch.indexName
        //  });
        // });

        var companyPromise =  db.sequelize.query("delete from company");
        var applicationPromise =  db.sequelize.query("delete from application");
        var developerPromise =  db.sequelize.query("delete from developer");
        var userPromise =  db.sequelize.query("delete from user");
        var messagePromise =  db.sequelize.query("delete from message");
        var attachmentPromise =  db.sequelize.query("delete from attachment");
        Promise.all([companyPromise,applicationPromise,developerPromise,userPromise,messagePromise,attachmentPromise]).then(()=>
        {
          done();
        });
    });

    afterEach(function() {

    });


    it('should send message from developer to client /chat/:appId/message POST',  function(done) {


      var companyPromise  =  db.company.create({
        id: 1,
        name: "app"
      });

      var applicationPromise =  db.application.create({
        id: 1,
        name: "app",
        company_id: 1
      });
      var developerPromise =  db.developer.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "mohamed@gmail.com",
        gender: "male",
        company_id: 1
      });
      var userPromise =  db.user.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "ali@gmail.com",
        gender: "male",
        age: 30,
        is_online: true,
        application_id: 1
      });
      var chatPromise =  db.chat.create({
        id: 1,
        user_id: 1,
        developer_id: 1,
        application_id: 1
      });
      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise,chatPromise])
      .then(() => {
        var appId = 1;
        var developerId = 1;
        var userId = 1;
        var content = 'hi';
        var messageDto = {
           id: 1,
           content: 'hi',
           chat_id: 1,
           fromId: developerId,
           toId: userId,
           senderEmail: 'mohamed@gmail.com',
           attachment: null
        };
       var expected = {
          success: true,
          result: messageDto
       };

        var url = `/chat/${appId}/message?from=${developerId}&to=${userId}&content=${content}`;
        db
        chai.request(server)
          .post(url)
          .end(function(err, res){
            res.should.have.status(200);
            // console.log(res.body.result.content);
            // res.body.should.be.eql(expected);
            expect(res.body.result.content).to.equal(expected.result.content);
            expect(res.body.result.fromId).to.equal(expected.result.fromId);
            expect(res.body.result.toId).to.equal(expected.result.toId);
            // res.body.should.be.eql(expected);
            done();
            // sendMessageStub.restore();
          });
      });

    });

    it('should not send message from developer to client exception occurs /chat/:appId/message POST', function(done) {

      var companyPromise  =  db.company.create({
        id: 1,
        name: "app"
      });

      var applicationPromise =  db.application.create({
        id: 1,
        name: "app",
        company_id: 1
      });
      var developerPromise =  db.developer.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "mohamed@gmail.com",
        gender: "male",
        company_id: 1
      });
      var userPromise =  db.user.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "ali@gmail.com",
        gender: "male",
        age: 30,
        is_online: true,
        application_id: 1
      });
      var chatPromise =  db.chat.create({
        id: 1,
        user_id: 1,
        developer_id: 1,
        application_id: 1
      });
      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise,chatPromise])
      .then(() => {
        var appId = 1;
        var developerId = 2;
        var userId = 1;
        var content = 'hi';
        var messageDto = {
           id: 1,
           content: 'hi',
           chat_id: 1,
           fromId: developerId,
           toId: userId,
           senderEmail: 'mohamed@gmail.com',
           attachment: null
        };
       var expected = {
          success: false,
          msg: `client id ${developerId} is not exist`
       };

        var url = `/chat/${appId}/message?from=${developerId}&to=${userId}&content=${content}`;
        db
        chai.request(server)
          .post(url)
          .end(function(err, res){
            res.should.have.status(500);
            expect(res.body.success).to.equal(expected.success);
            expect(res.body.msg).to.equal(expected.msg);
            done();
          });
      });
    });


    it('should list ALL chat instances for a developer on /chat GET', function(done) {

      var companyPromise  =  db.company.create({
        id: 1,
        name: "app"
      });

      var applicationPromise =  db.application.create({
        id: 1,
        name: "app",
        company_id: 1
      });
      var developerPromise =  db.developer.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "mohamed@gmail.com",
        gender: "male",
        company_id: 1
      });
      var userPromise =  db.user.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "ali@gmail.com",
        gender: "male",
        age: 30,
        is_online: true,
        application_id: 1
      });
      var chatPromise =  db.chat.create({
        id: 1,
        user_id: 1,
        developer_id: 1,
        application_id: 1
      });

      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise,chatPromise])
      .then(() => {
        var developerId = 1;
        var isClient = false;
        var chatDto = {
            id: 1,
            user_id: 1,
            developer_id: developerId,
            to_user: {id:1,first_name:"mohamed",last_name:"mohamed",email:"mohamed@gmail.com",gender:"male",company_id:1}
        };
        var expected = {
          success: true,
          result: [chatDto]
        };

        var url = `/chat?userId=${developerId}&isClient=${isClient}`;
        db
        chai.request(server)
          .get(url)
          .end(function(err, res){
            res.should.have.status(200);
            res.body.should.be.eql(expected);
            expect(res.body.success).to.equal(expected.success);
            done();
          });
      });

    });

    it('should list all chat messages on /chat/1/messages GET', function(done) {

      var companyPromise  =  db.company.create({
        id: 1,
        name: "app"
      });

      var applicationPromise =  db.application.create({
        id: 1,
        name: "app",
        company_id: 1
      });
      var developerPromise =  db.developer.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "mohamed@gmail.com",
        gender: "male",
        company_id: 1
      });
      var userPromise =  db.user.create({
        id: 1,
        first_name: "mohamed",
        last_name: "mohamed",
        email: "ali@gmail.com",
        gender: "male",
        age: 30,
        is_online: true,
        application_id: 1
      });
      var chatPromise =  db.chat.create({
        id: 1,
        user_id: 1,
        developer_id: 1,
        application_id: 1
      });
      var message1Promise =  db.message.create({
        id: 1,
        content: 'hi',
        chat_id: 1,
        is_client: false
      });
      var message2Promise =  db.message.create({
        id: 2,
        content: 'hi there',
        chat_id: 1,
        is_client: true
      });

      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise,chatPromise,message1Promise,message2Promise])
      .then(() => {
        var chatId = 1;
        var messageDto1 = {
          id: 1,
          content: 'hi',
          is_client: false,
          fromId: 1,
          toId: 1,
          senderEmail: "mohamed@gmail.com",
          attachment: null
        };
        var messageDto2 = {
          id: 2,
          content: 'hi threre',
          is_client: true,
          fromId: 1,
          toId: 1,
          senderEmail: "ali@gmail.com",
          attachment: null
        };
        var expected = {
          success: true,
          result: [messageDto1,messageDto2]
        };
        var expectedSize = 2;
        var url = `/chat/${chatId}/messages`;
        db
        chai.request(server)
          .get(url)
          .end(function(err, res){
            res.should.have.status(200);
            expect(res.body.result.length).to.equal(expectedSize);
            expect(res.body.result[0].id).to.equal(1);
            expect(res.body.result[1].id).to.equal(2);
            expect(res.body.success).to.equal(expected.success);
            done();
          });
      });

    });
    it('should search for term in chat messages /chat/1/search?term=hi GET', function(done) {
        var messageDto = {
          id: 1,
          content: content,
          is_client: true,
          fromId: 1,
          toId: 1,
          senderEmail: "mohamed@gmail.com",
          attachment: null
        };
        var expected = {
          success: true,
          result: [messageDto]
        };
        var content = "hi";
        var searchDoumentStub = sinon.stub(elasticSearch,"searchDocument").callsFake((data)=>{
          return {
            hits:{
              hits:[{
                _source:{
                  suggest:{
                      payload: {
                        message:{
                          id: 1,
                          content: data.content,
                          is_client: true,
                          fromId: 1,
                          toId: 1,
                          senderEmail: "mohamed@gmail.com",
                          attachment: null
                      }
                    }
                  }
                }
              }]
            }
            };
        });
        var messageDto = {
          id: 1,
          content: content,
          is_client: true,
          fromId: 1,
          toId: 1,
          senderEmail: "mohamed@gmail.com",
          attachment: null
        };
        var expected = {
          success: true,
          result: [messageDto]
        };
        var expectedSize = 1;
        var searchTerm = 'hi';
        var chatId = 1;
        var url = `/chat/${chatId}/search?term=${searchTerm}`;
        db
        chai.request(server)
          .get(url)
          .end(function(err, res){
            res.should.have.status(200);
            expect(res.body.result.length).to.equal(expectedSize);
            expect(res.body.result[0].id).to.equal(1);
            expect(res.body.result[0].content).to.equal("hi");
            expect(res.body.success).to.equal(expected.success);
            searchDoumentStub.restore();
            done();
          });
      });
});
