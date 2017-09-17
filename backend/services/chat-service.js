var db = require('../models');
var tokenUtil = require('../helpers/token-utility');
var fs = require('fs');

class ChatService {

    /////////////////////// handles new Connections
    receiveConnections(io, callback) {
        io.on('connection', callback);
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
            //@TODO insert messages in elastic search

            var fromId = message.fromId;
            var toId = message.toId;
            var appId = message.appId;
            var content = message.content;
            var attachment = message.attachment;
            var isClient = message.isClient;

            var app = await db.application.findOne({where: {id: appId}});

            if(!app){
                throw new Error(`App id ${appId} is not exist`);
            }


            var chat = null;
            if(isClient){
                // now from is a client and to is a developer
                var user1 = await db.user.findOne({where:{id: fromId}});

                var user2 = await db.developer.findOne({where:{id: toId }});

                if(!user1){
                    throw new Error(`client id ${fromId} is not exist`);
                }
                if(!user2){
                    throw new Error(`developer id ${toId} is not exist`);
                }
                message.fromEmail = user1.email;
                chat = await db.chat.findOne({where:{$and:[{user_id: fromId},{developer_id: toId}]}});
                if(!chat){
                    chat = await db.chat.create({user_id:fromId, developer_id: toId});
                }
            }else {
                // now from is a developer and to is a client
                var user1 = await db.user.findOne({where:{id: toId}});

                var user2 = await db.developer.findOne({where:{id: fromId }});

                if(!user1){
                    throw new Error(`client id ${toId} is not exist`);
                }
                if(!user2){
                    throw new Error(`developer id ${fromId} is not exist`);
                }
                message.fromEmail = user2.email;
                chat = await db.chat.findOne({where:{$and:[{user_id: toId},{developer_id: fromId}]}});
                if(!chat){
                    chat = await db.chat.create({user_id:toId, developer_id: fromId});
                }
            }


            var savedAttachment = {};
            if(attachment){
                        // there is an attachment
                var attachmentGeneratedName = await this.uploadMessageAttachment(attachment);

                savedAttachment = await db.attachment.create({file_path: attachmentGeneratedName});
            }

            var createdMessage = await db.message.create({content: content, chat_id: chat.id, is_client: isClient, attachment_id: savedAttachment.id });

            message.created_at = createdMessage.created_at;
            message.chat_id = chat.id;
            message.attachment_id = savedAttachment.id;

            socketIo.to(appId).emit(toId, message);
        }catch(ex) {
            throw ex;
        }
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
        if(isClient){
            chats = await db.chat.findAll({where: {user_id: userId},include: [ { model: db.developer, nested: true } ]},);

        }else {
            chats = await db.chat.findAll({where: {developer_id: userId}, include: [ { model: db.user, nested: true } ]});
        }

        return chats;
    }

    async getChatMessages(chatId, offset ,limit) {
        var chat = await db.chat.findOne({where:{id: chatId}});
        if(!chat){
            throw new Error(`There is no chat with id ${chatId}`);
        }
        var messages = [];

        if(offset >= 0 && limit > 0){
            messages = await db.message.findAll({where:{chat_id: chatId},include:[{model: db.attachment, nested: true}],offset:offset,limit:limit});
        }else {
            messages = await db.message.findAll({where:{chat_id: chatId},include:[{model: db.attachment, nested: true}]});
        }
        return messages;
    }
}

module.exports = new ChatService();