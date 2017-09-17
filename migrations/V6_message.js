module.exports = {
  up: function(queryInterface, Sequelize, done) {
    queryInterface.createTable('message',{
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        content: {
           type: Sequelize.STRING(500),
           allowNull: true
        },
        is_client: {
           type: Sequelize.BOOLEAN,
           allowNull: true
        },
        chat_id: {
          type:  Sequelize.INTEGER,
          references: {
            model: 'chat',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        attachment_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false
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
    queryInterface.dropTable('message')
  }
}