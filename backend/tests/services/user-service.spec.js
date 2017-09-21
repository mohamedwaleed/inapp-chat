'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var sinon = require('sinon');
var app = require('http');
var clientIo = require('socket.io-client');
const db = require('../../models');
var should = chai.should();
var expect = chai.expect;
var userService = require('../../services/user-service');

describe("Chat service", function(){


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


    it('should update user status',  function(done) {
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
        is_online: false,
        application_id: 1
      });
      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise])
      .then(()=>{
        var expectedAffectedRows = 1;

        userService.updateUserStatus(true, "ali@gmail.com").then((affectedRows)=>{
          expect(affectedRows).to.equal(expectedAffectedRows);
          done();
        });

      });


    });


    it('should find user or developer from database',  function(done) {
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
        is_online: false,
        application_id: 1
      });
      Promise.all([companyPromise,applicationPromise,developerPromise,userPromise])
      .then(()=>{
        var expectedAffectedRows = 1;
        var expected = {
          id: 1,
          first_name: "mohamed",
          last_name: "mohamed",
          email: "ali@gmail.com",
          gender: "male",
          age: 30,
          is_online: false,
          application_id: 1
        };
        userService.findUser("ali@gmail.com",1,true).then((user)=>{
          expect(user).to.not.equal(null);
          expect(user.id).to.equal(expected.id);
          expect(user.first_name).to.equal(expected.last_name);
          expect(user.last_name).to.equal(expected.last_name);
          expect(user.email).to.equal(expected.email);
          expect(user.gender).to.equal(expected.gender);
          expect(user.age).to.equal(expected.age);
          expect(user.is_online).to.equal(expected.is_online);
          expect(user.application_id).to.equal(expected.application_id);
          done();
        });

      });


    });

    it('should register user or developer in database',  function(done) {
      var companyPromise  =  db.company.create({
        id: 1,
        name: "app"
      });

      var applicationPromise =  db.application.create({
        id: 1,
        name: "app",
        company_id: 1
      });

      Promise.all([companyPromise,applicationPromise])
      .then(()=>{
        var expectedAffectedRows = 1;
        var expected = {
          id: 1,
          email: "ali@gmail.com",
          is_online: false,
          application_id: 1
        };
        userService.registerUser("ali@gmail.com",1,true).then((user)=>{
          expect(user).to.not.equal(null);
          expect(user.id).to.not.equal(null);
          expect(user.email).to.equal(expected.email);
          expect(user.is_online).to.equal(expected.is_online);
          expect(user.application_id).to.equal(expected.application_id);
          done();
        });

      });


    });
});
