
module.exports = function(sequelize, DataTypes) {

    const Chat = sequelize.define('chat', {
          id: {
             type: DataTypes.INTEGER,
             primaryKey: true,
             autoIncrement: true
          }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: false
    });

    Chat.associate = function(models) {
        Chat.hasMany(models.message,{foreignKey: 'chat_id',timestamps: false});
        Chat.belongsTo(models.user, {foreignKey: 'user_id'});
        Chat.belongsTo(models.developer, {foreignKey: 'developer_id'});
    }
    return Chat;
}