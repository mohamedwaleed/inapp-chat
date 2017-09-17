'use strict';

class TokenUtil {
    generateToken(tokenLength) {
        const chars = "abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var token = "";
        for(var i = 0 ; i < 10 ; i ++){
            var index = (Math.floor(Math.random() * 100) % chars.length);
            token += chars[index];
        }
        return token;
    }
}

var tokenUtil = null;
function tokenFactory() {
    if(tokenUtil === null){
        tokenUtil = new TokenUtil();
    }
    return tokenUtil;
}

module.exports = tokenFactory();