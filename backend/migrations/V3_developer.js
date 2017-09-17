module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.createTable('developer',{
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        first_name: {
           type: Sequelize.STRING(50),
           allowNull: true
        },
        last_name: {
           type: Sequelize.STRING(50),
           allowNull: true
        },
        gender: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: true,
            unique: true
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
    queryInterface.dropTable('developer')
  }
}