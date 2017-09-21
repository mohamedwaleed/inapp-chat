'use strict';

var db = require('../models');

class UserService {

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


}

module.exports = new UserService();
