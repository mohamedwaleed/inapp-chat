module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.sequelize.query("insert into application(name, company_id) values ('app1', 1)")
    .then(()=>{
            done();
        });
  },

  down: function(queryInterface, Sequelize) {

  }
}