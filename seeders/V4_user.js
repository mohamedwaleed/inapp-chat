module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.sequelize.query("insert into user(first_name, last_name, gender, age, email, is_online, application_id) values ('Ali', 'Mohamed', 'male',30, 'ali@gmail.com',false, 1)")
    .then(()=>{

        queryInterface.sequelize.query("insert into user(first_name, last_name, gender, age, email, is_online, application_id) values ('John', 'Smith', 'male',25 ,'john@gmail.com',false, 1)")
        .then(()=>{
           done();
        });

    });

  },

  down: function(queryInterface, Sequelize) {

  }
}