var InAppChat = (function inAppChat(io) {
		
	const BASE_URL = 'http://localhost:3000';
	const isClient = true;

	var module = {exports:{}};
	var messages = {};
  	var selectedEmail = null;
  	var myId = null;
  	var myEmail = '';
  	var selectedDeveloperId = null;
  	var appId = null;

	///////////////// helpers //////////////////////////////

	module.ajaxCall = function (requestObject) {
		var xmlhttp = new XMLHttpRequest();

	    xmlhttp.onreadystatechange = function() {
	        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
	           if (xmlhttp.status == 200) {
					requestObject.sucess(xmlhttp.responseText);
	           }else {
	           		requestObject.fail(xmlhttp.status);
	           }
	        }
	    };


	    xmlhttp.open(requestObject.method, requestObject.url , true);
	    xmlhttp.send();
	};
	module.scrollDown = function scrollDown(elementId) {
		var objDiv = document.getElementById(elementId);
		objDiv.scrollTop = objDiv.scrollHeight;
	};
	module.hide = function(elementId) {
		var chatBodyElement = document.getElementById(elementId);
		chatBodyElement.style.display = 'none';
	};
	module.show = function(elementId) {
		var chatBodyElement = document.getElementById(elementId);
		chatBodyElement.style.display = 'block';
	};
	module.toggle = function(elementId) {
		var element = document.getElementById(elementId); 
		var status = element.style.display;
		if(status === 'block'){
			element.style.display = 'none'
		}else {
			element.style.display = 'block';
		}
	};
	module.renderMessages = function(email) {
			
			var chatAreaElement = document.getElementById('chat-area');
			var messagesKeys = Object.keys(messages);
			var emailMessages = messages[email];
			chatAreaElement.innerHTML = '';

			for(var i = 0 ; i < emailMessages.length ; i ++ ){
				var message = emailMessages[i];
				module.renderNewMessage(email, message);
			}
		
			module.scrollDown('chat-area');
	}

	module.renderNewMessage = function(email, message) {
		var chatAreaElement = document.getElementById('chat-area');
		if(!message.is_client){
			// not my message 
			chatAreaElement.innerHTML += '<div class="receiver"><div class="username">'+email+'</div><br><br><div class="message">'+message.content+'</div><label class="time">'+new Date(message.created_at)+'</label></div>';
		}else {
			chatAreaElement.innerHTML += '<div class="sender"><div class="username">'+myEmail+'</div><br><br><div class="message">'+message.content+'</div><label class="time">'+new Date(message.created_at)+'</label></div>';
		}
	};
	module.renderNewDeveloper = function (email, developerId, chatId) {
			var developersElement = document.getElementById("developers");
			if(!messages[email]){
				var div1 = document.createElement('div');
				var div2 = document.createElement('div');
				var link = document.createElement('a');
				
				div1.className = "element";
				div2.className = "email";
		        link.id = email;
		        link.innerHTML = email;
		        link.href = '#';
		        link.developerId = developerId;

		        div1.appendChild(div2);
		        div2.appendChild(link);
		        developersElement.appendChild(div1);
			}
			document.getElementById(email).addEventListener("click",function(){
				var chatBodyElement = document.getElementById("chat-body"); 
				var developersElement = document.getElementById("developers"); 

				var status = chatBodyElement.style.display;
				module.show("chat-body");
				module.hide("developers");

				selectedEmail = email;
				selectedDeveloperId = developerId;

				module.ajaxCall({
					url: BASE_URL + '/chat/'+chatId+'/messages',
					method: 'GET',
					sucess: function(responseText){
						var response = JSON.parse(responseText);
						var responseMessages = response.result;
						messages[email] = [];
						for(var i = 0 ; i < responseMessages.length; i ++ ){
							messages[email].push(responseMessages[i]);
						}
						module.renderMessages(email);
					},
					fail: function(){
						console.log("error");
					}
				});

			});
	}
	module.appendUi  = function() {
		var body = document.querySelector("body");
		  var chatButton = document.createElement("button");
		  chatButton.id = 'chat_button';
		  chatButton.innerHTML = 'Chat';
		  body.innerHTML += '<div id="container">'+
								'<h2 class="center">Chat with developers <a href="#" id="back">back</a></h2>'+
								'<hr style="width:80%">'+
								'<div id="developers">'+
									'<!-- <div class="element">'+
										'<div class="email"><a href="#">mohamedwaleed2012@gmail.com</a></div>'+
									'</div>'+
									 '-->'+

								'</div>'+
								'<div id="chat-body">'+
									'<div id="chat-area">'+
										
										'<!-- <div class="receiver">'+
											'<div class="username">mohamed@gmail.com</div>'+
											'<br>'+
											'<br>'+
											'<div class="message">ffdd</div>'+
											'<label class="time">3:00 AM</label>'+
										'</div> -->'+
										'<div id="scroll"></div>'+
									'</div>'+
									'<div class="message-area">'+
										'<textarea id="message" class="textarea-control"></textarea>'+
										'<button id="send" class="send">Send</button>'+
									'</div>'+
											
								'</div>'+
							'</div>';
		  body.appendChild(chatButton);
	};
	module.bindUiActions = function () {
			document.getElementById("chat_button").addEventListener("click", function(){
				module.toggle("container");
			});

			var developers = document.getElementsByClassName("email");

			for(var i = 0 ; i < developers.length ; i ++ ){
				developers[i].addEventListener("click", function(){
					module.show("chat-body");
					module.hide("developers")
				});
			}

			document.getElementById("back").addEventListener("click", function(){
				module.hide("chat-body");
				module.show("developers");
				selectedEmail = null;
			});

			document.getElementById("send").addEventListener("click", function(){
				var messagContent = document.getElementById("message").value;
				document.getElementById("message").value = '';
				var message = {
					content: messagContent,
					created_at: new Date(),
					is_client: true
				};

				module.renderNewMessage(myEmail, message);
				
				module.scrollDown('chat-area');

				module.ajaxCall({
					url: BASE_URL + '/chat/'+appId+'/message?from='+myId+'&to='+selectedDeveloperId+'&content='+ messagContent+'&isClient=true',
					method: 'POST',
					sucess: function(responseText){
						
					},
					fail: function(){
						alert("error in sending the last message");
					}
				});
			});

	};

	module.messageCallback = function (message) {
	  		if(message.fromId === selectedDeveloperId){
	  			module.renderNewMessage(message.senderEmail, message);
	  			module.scrollDown('chat-area');
	  		}

	  		module.renderNewDeveloper(message.senderEmail, message.fromId,  message.chat_id);

	}

	module.userIdCallback = function(userId) {
		myId = userId;
		module.ajaxCall({
			url: BASE_URL + '/chat?userId='+userId+'&isClient=true',
			method: 'GET',
			sucess: function(responseText){
				var response = JSON.parse(responseText);
				var chats = response.result;
				for(var i = 0 ; i < chats.length ;  i ++ ){
					module.renderNewDeveloper(chats[i].developer.email, chats[i].developer.id , chats[i].id);
					messages[chats[i].developer.email] = [];
				}
			},
			fail: function(){
				console.log("error");
			}
		});
	}
	//////////////////////////////////////////////////////////





	// public Api
	module.exports.init = function __init__(params, messageCallback, userIdCallback) {

		  myEmail = params.email;
		  appId = params.appId
		  
		  window.onload = function(){
		  	module.appendUi();
		  	module.bindUiActions();
		  }
		  

		  var socket = io(BASE_URL,{query: 'app_id='+appId+'&user_email=' + myEmail + '&is_client=' + isClient});

		  socket.on('user_id', function (userId) {
		  	  if(userIdCallback){
		  	  	userIdCallback(userId);
		  	  }
		  	  module.userIdCallback(userId);
		  	  socket.on('client' + userId, function (message) {
		  	  	if(messageCallback){
			  		messageCallback(message);
			  	}
			  	module.messageCallback(message);
			  });
		  });
	}

	return module.exports;
})(io);