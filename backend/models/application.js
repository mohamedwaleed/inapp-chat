
module.exports = function(sequelize, DataTypes) {

    var Application = sequelize.define('application', {
           id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
             type: DataTypes.STRING(50),
             allowNull: false
          },
          company_id: {
            type:  DataTypes.INTEGER,
            references: {
              model: 'company',
              key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
          }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: false
    });


    Application.associate = function(models) {

      Application.hasMany(models.user,{foreignKey: 'application_id',timestamps: false});

    }

    return Application;
}


