module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.createTable('application',{
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
           type: Sequelize.STRING(50),
           allowNull: false
        },
        company_id: {
          type:  Sequelize.INTEGER,
          references: {
            model: 'company',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
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
    queryInterface.dropTable('application')
  }
}