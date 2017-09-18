var db = require('../models');
var tokenUtil = require('../helpers/token-utility');
var elasticSearch = require('../services/elasticsearch-service');
var fs = require('fs');

class ChatService {

    /////////////////////// handles new Connections
    receiveConnections(socketIo, callback) {
        socketIo.on('connection', callback);
    }


    /////////////////////// handles disconnections
    receiveDisconnections(socket, callback) {
        socket.on('disconnect', callback);
    }



    updateUserStatus(status=false, email) {
        var result = db.user.update({is_online: status}, {where: {email:email}}).then(res=>JSON.parse(res));
        return result;
    }


    findUser(email, app_id, isClient) {
        if(isClient){
           return db.user.findOne({where:{email:email, application_id: app_id}});
        }
        return db.developer.findOne({where:{email:email, application_id: app_id}});
    }

    registerUser(email, app_id, isClient) {
        if(isClient){
            return db.user.create({email:email, application_id: app_id});
        }
        return db.developer.create({email:email, application_id: app_id});
    }

    async sendMessage(message, socketIo) {

        try{

            var fromId = parseInt(message.fromId);
            var toId = parseInt(message.toId);
            var appId = message.appId;
            var content = message.content;
            var attachment = message.attachment;
            var isClient = message.isClient;

            var app = await db.application.findOne({where: {id: appId}});

            if(!app){
                throw new Error(`App id ${appId} is not exist`);
            }

            var createdChat = await this.createChatInstanceIfNotExist(fromId, toId, isClient);
            var to = createdChat.to;
            var senderEmail = createdChat.senderEmail;
            var chat = createdChat.chat;

            var savedAttachment = {};
            if(attachment){
                // there is an attachment
                var attachmentGeneratedName = await this.uploadMessageAttachment(attachment);

                savedAttachment = await db.attachment.create({file_path: attachmentGeneratedName});
            }

            var createdMessage = await db.message.create({content: content, chat_id: chat.id, is_client: isClient, attachment_id: savedAttachment.id });

            var messageDto = {
               id: createdMessage.id,
               content: createdMessage.content,
               chat_id: createdMessage.chat_id,
               is_client: isClient,
               created_at: createdMessage.created_at,
               updated_at: createdMessage.updated_at,
               fromId: fromId,
               toId: toId,
               senderEmail: senderEmail,
               attachment: savedAttachment
            };
            elasticSearch.addDocument(messageDto);
            socketIo.to(appId).emit(to + toId, messageDto);

            return messageDto;
        }catch(ex) {
            throw ex;
        }
    }

    async createChatInstanceIfNotExist(_fromId, _toId, isClient) {
      var to = '';
      var senderEmail = '';
      var fromId = _fromId;
      var toId = _toId;
      if(!isClient){
        // swap fromId and toId in case of developer is the sender
        var tmpFromId = fromId;
        toId = fromId;
        fromId = tmpFromId;
      }
      var clientUser = await db.user.findOne({where:{id: fromId}});

      var developerUser = await db.developer.findOne({where:{id: toId }});

      if(!clientUser){
          throw new Error(`client id ${fromId} is not exist`);
      }
      if(!developerUser){
          throw new Error(`developer id ${toId} is not exist`);
      }
      // message.fromEmail = user1.email;
      var chat = await db.chat.findOne({where:{$and:[{user_id: fromId},{developer_id: toId}]}});
      if(!chat){
          chat = await db.chat.create({user_id:fromId, developer_id: toId});
      }

      senderEmail = (!isClient)?developerUser.email:clientUser.email;
      to = (!isClient)?'client':'developer';

      var returnedChatInstance = {
        chat: chat,
        senderEmail: senderEmail,
        to: to
      };
      return returnedChatInstance;
    }

    async uploadMessageAttachment(attachment) {
        if(!attachment){
            return "";
        }
        const dir = "attachments/";
        const attachmentGeneratedName = tokenUtil.generateToken() + attachment.name;
        const completeDir = dir + attachmentGeneratedName;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        try{
            await attachment.mv(completeDir);
            return attachmentGeneratedName;
        }catch(error){
            throw error;
        }
    }

    async getChatInstances(query) {
        var userId = query.userId;
        var isClient = query.isClient;
        if(!userId){
            throw new Error('User id is missing');
        }

        var chats = [];
        var  chatDtos = [];
        if(isClient){
            chats = await db.chat.findAll({where: {user_id: userId},include: [ { model: db.developer, nested: true } ]});
            chatDtos = chats.map((chat) => {
              var chatDto = {
                id: chat.id,
                user_id: chat.user_id,
                developer_id: chat.developer_id,
                to_user: chat.developer
              };
              return chatDto;
            });
        }else {
            chats = await db.chat.findAll({where: {developer_id: userId}, include: [ { model: db.user, nested: true } ]});
            chatDtos = chats.map((chat) => {
              var chatDto = {
                id: chat.id,
                user_id: chat.user_id,
                developer_id: chat.developer_id,
                to_user: chat.user
              };
              return chatDto;
            });
        }
        return chatDtos;
    }

    async getChatMessages(chatId, offset ,limit) {
        var chat = await db.chat.findOne({where:{id: chatId},include:[{ model: db.developer, nested: true },{ model: db.user, nested: true }]});
        if(!chat){
            throw new Error(`There is no chat with id ${chatId}`);
        }
        var messages = [];

        if(offset >= 0 && limit > 0){
            messages = await db.message.findAll({where:{chat_id: chatId},include:[{model: db.attachment, nested: true}],offset:offset,limit:limit,order: [
            ['created_at', 'ASC']
          ]});
        }else {
            messages = await db.message.findAll({where:{chat_id: chatId},include:[{model: db.attachment, nested: true}],order: [
            ['created_at', 'ASC']
          ]});
        }
        var messageDtos = messages.map((message) => {
          var fromId = (!message.is_client)?chat.developer_id:chat.user_id;
          var toId = (!message.is_client)?chat.user_id:chat.developer_id;
          var senderEmail = (!message.is_client)?chat.developer.email:chat.user.email;
          var messageDto = {
            id: message.id,
            content: message.content,
            is_client: message.is_client,
            created_at: message.created_at,
            updated_at: message.updated_at,
            fromId: fromId,
            toId: toId,
            senderEmail: senderEmail,
            attachment: message.attachment
          };
          return messageDto;
        });
        return messageDtos;
    }
}

module.exports = new ChatService();
