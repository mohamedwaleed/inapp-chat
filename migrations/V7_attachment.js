module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.createTable('attachment',{
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        file_path: {
           type: Sequelize.STRING(500),
           allowNull: true
        }
    },
    {
        engine: 'InnoDB'
    }
    ).then(()=>{
             done();
         });
  },

  down: function(queryInterface, Sequelize) {
    queryInterface.dropTable('attachment')
  }
}