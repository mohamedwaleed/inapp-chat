
module.exports = function(sequelize, DataTypes) {
    const Developer = sequelize.define('developer', {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          first_name: {
             type: DataTypes.STRING(50),
             allowNull: true
          },
          last_name: {
             type: DataTypes.STRING(50),
             allowNull: true
          },
          gender: {
              type: DataTypes.STRING,
              allowNull: false
          },
          email: {
              type: DataTypes.STRING(50),
              allowNull: true,
              unique: true
          }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: false
    });

    Developer.associate = function(models) {
        Developer.belongsToMany(models.user, {through: 'chat',foreignKey: 'developer_id',timestamps: false});
    }

    return Developer;
}