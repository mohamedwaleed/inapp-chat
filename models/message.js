
module.exports = function(sequelize, DataTypes) {
    const Message = sequelize.define('message', {
            id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            content: {
               type: DataTypes.STRING(500),
               allowNull: true
            },
            is_client: {
               type: DataTypes.BOOLEAN,
               allowNull: true
            }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: true,
      underscored: true
    });

    Message.associate = function(models) {
         Message.belongsTo(models.attachment,{foreignKey: 'attachment_id'});
         Message.belongsTo(models.chat, {foreignKey: 'chat_id'});
    }
    return Message;
}