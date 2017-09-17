'use strict';

var chatService = require('../services/chat-service');

module.exports = function(io) {


    chatService.receiveConnections(io, async (socket)=>{
        var handshakeData = socket.request;


        var roomNumber = handshakeData._query['app_id'];
        var user_email = handshakeData._query['user_email'];
        var isClient = handshakeData._query['is_client'];

        // it is better to use caching database (redis) for fast retrieval
        var user = await chatService.findUser(user_email, roomNumber, isClient);
        if(!user){
            user = await chatService.registerUser(user_email, roomNumber, isClient);
        }
        socket.join(roomNumber);
        await chatService.updateUserStatus(true, user_email);

        io.to(roomNumber).emit('user_id', user.id);
        chatService.receiveDisconnections(socket, ()=>{
            console.log('user disconnected');
            chatService.updateUserStatus(false, user_email);
        });
    });

}