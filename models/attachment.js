var sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {

    const Attachment = sequelize.define('attachment', {
            id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            file_path: {
               type: DataTypes.STRING(500),
               allowNull: true
            }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: false
    });

    return Attachment;
}
