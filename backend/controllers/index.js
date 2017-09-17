var express = require('express');
var router = express.Router();
var chat = require('./chat');


router.use('/chat',chat);


module.exports = router;
