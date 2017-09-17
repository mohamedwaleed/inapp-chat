module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.sequelize.query("INSERT INTO `developer` (`first_name`, `last_name`, `gender`, `email`, `company_id`) VALUES ('Mohamed', 'Waleed', 'male', 'mohamedwaleed2012@gmail.com', '1')")
    .then(()=>{

          queryInterface.sequelize.query("INSERT INTO `developer` (`first_name`, `last_name`, `gender`, `email`, `company_id`) VALUES ('Will', 'Smith', 'male', 'will@gmail.com', '1')").then(()=>{
            done();
          });

        });
  },

  down: function(queryInterface, Sequelize) {

  }
}