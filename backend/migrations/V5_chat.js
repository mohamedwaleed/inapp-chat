module.exports = {
  up: function(queryInterface, Sequelize, done) {

     queryInterface.createTable('chat',{
            id: {
               type: Sequelize.INTEGER,
               primaryKey: true,
               autoIncrement: true
            },
            user_id: {
              type:  Sequelize.INTEGER,
              references: {
                model: 'user',
                key: 'id'
              },
              onUpdate: 'cascade',
              onDelete: 'cascade'
            },
            developer_id: {
              type:  Sequelize.INTEGER,
              references: {
                 model: 'developer',
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
    queryInterface.dropTable('chat');
  }
}