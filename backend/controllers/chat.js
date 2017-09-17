var express = require('express');
var router = express.Router();
var db = require('../models');
var chatService = require('../services/chat-service');

// send message
router.post('/:appId/message', async (req, res, next)=>{
  try{
      var appId = req.params.appId;
      var from = req.query.from;
      var to = req.query.to;
      var isClient = req.query.isClient;
      var attachment = null;
      var content = req.query.content;
      var socketIo = req.io;

      if(req.files){
        attachment = req.files.attachment;
      }
      await chatService.sendMessage({
        fromId: from,
        toId: to,
        content: content,
        appId: appId,
        isClient: isClient,
        attachment: attachment
      },socketIo);
      res.send({success: true});
  }catch(ex){
      res.status(500).send({success: false, msg: ex.message});
  }

});

// get all chat instances
router.get('/', async (req, res, next)=> {
 try{
      var userId = req.query.userId;
      var isClient = req.query.isClient;

      var chats = await chatService.getChatInstances({
        userId: userId,
        isClient: isClient
      });
      res.send({success: true, result: chats});
 }catch(ex) {
      res.status(500).send({success: false, msg: ex.message});
 }
});


// get chat messages
router.get('/:chatId/messages', async (req, res, next)=> {
 try{
      var chatId = req.params.chatId;
      var offset = req.query.offset;
      var limit = req.query.limit;

      var messages = await chatService.getChatMessages(chatId, parseInt(offset), parseInt(limit));
      res.send({success: true, result: messages});
 }catch(ex) {
      res.status(500).send({success: false, msg: ex.message});
 }
});



router.get('/:chatId/search', async (req, res, next)=> {
 try{
      var chatId = req.params.chatId;
      var term = req.query.term;
      // use elastic search
      res.send({success: true, result: null});
 }catch(ex) {
      res.status(500).send({success: false, msg: ex.message});
 }
});

module.exports = router;