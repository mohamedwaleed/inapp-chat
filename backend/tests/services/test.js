process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../app');
var sinon = require('sinon');
var should = chai.should();
var expect = chai.expect
var chatService = require('../../services/chat-service');

chai.use(chaiHttp);

it('should send message from developer to client /chat/:appId/message POST', function(done) {

  var appId = 1;
  var messageDto = {
     id: 1,
     content: 'hi',
     chat_id: 1,
     is_client: false,
     created_at: '',
     updated_at: '',
     fromId: 1,
     toId: 1,
     senderEmail: 'mohamed@gmail.com',
     attachment: null
  };
  var expected = {
      success: true,
      result: messageDto
   };
  var sendMessageStub = sinon.stub(chatService, 'sendMessage').callsFake(
  function(message, socketIo){
      return messageDto;
  });
  chai.request(server)
    .post('/chat/'+appId+'/message')
    .end(function(err, res){
      res.should.have.status(200);
      res.body.should.be.eql(expected);
      done();
      sendMessageStub.restore();
    });
});

it('should not send message from developer to client exception occurs /chat/:appId/message POST', function(done) {

  var appId = 1;
  var messageDto = {
     id: 1,
     content: 'hi',
     chat_id: 1,
     is_client: false,
     created_at: '',
     updated_at: '',
     fromId: 1,
     toId: 1,
     senderEmail: 'mohamed@gmail.com',
     attachment: null
  };
  var msg = "Invalide app id"
  var expected = {
      success: false,
      msg: msg
   };
  var sendMessageStub = sinon.stub(chatService, 'sendMessage').callsFake(
  function(emssage, socketIo){
      throw new Error(msg);
  });
  chai.request(server)
    .post('/chat/'+appId+'/message')
    .end(function(err, res){
      res.should.have.status(500);
      res.body.should.be.eql(expected);
      done();
      sendMessageStub.restore();
    });
});

it('should list ALL chat instances for a client on /chat GET', function(done) {
  var clientId = 1;
  var isClient = true;
  var chatDto = {
      id: 1,
      user_id: 1,
      developer_id: clientId,
      to_user: {first_name:"mohamed",last_name:"mohamed"}
  };
  var expected = {
    success: true,
    result: [chatDto]
  };
  var getChatInstancesStub = sinon.stub(chatService, 'getChatInstances').callsFake(
  function(query){

      return [chatDto];
  });
  chai.request(server)
    .get('/chat?userId='+clientId+'&isClient='+isClient)
    .end(function(err, res){
      res.should.have.status(200);
      res.body.should.be.eql(expected);
      done();
      getChatInstancesStub.restore();
    });
});


it('should list ALL chat instances for a developer on /chat GET', function(done) {
  var developerId = 1;
  var isClient = false;
  var chatDto = {
      id: 1,
      user_id: 1,
      developer_id: developerId,
      to_user: {first_name:"mohamed",last_name:"mohamed"}
  };
  var expected = {
    success: true,
    result: [chatDto]
  };
  var getChatInstancesStub = sinon.stub(chatService, 'getChatInstances').callsFake(
  function(query){

      return [chatDto];
  });
  chai.request(server)
    .get('/chat?userId='+developerId+'&isClient='+isClient)
    .end(function(err, res){
      res.should.have.status(200);
      res.body.should.be.eql(expected);
      done();
      getChatInstancesStub.restore();
    });
});