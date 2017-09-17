module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.sequelize.query("insert into company(name) values ('instabug')")
    .then(()=>{
        done();
    });

  },

  down: function(queryInterface, Sequelize) {

  }
}