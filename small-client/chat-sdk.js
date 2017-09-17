var InAppChat = (function inAppChat(argument) {
		
	const BASE_URL = 'http://localhost:3000';

	function __init__(params, messageCallback, userIdCallback) {

		  const email = params.email;
		  const appId = params.appId;
		  const isClient = true;
		  var myId = -1;
		  var socket = io(BASE_URL,{query: 'app_id='+appId+'&user_email=' + email + '&is_client=' + isClient});

		  socket.on('user_id', function (userId) {
		  	  myId = userId;
		  	  userIdCallback(userId);
		  	  socket.on('client' + myId, function (message) {
			  	messageCallback(message);
			  });
		  });
	}

	return {
		init: __init__
	};

})();