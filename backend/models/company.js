
module.exports = function(sequelize, DataTypes) {
    const Company = sequelize.define('company', {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
             type: DataTypes.STRING(50),
             allowNull: false
          }
    }, {
      freezeTableName: true, // Model tableName will be the same as the model name
      timestamps: false
    });


    Company.associate = function(models) {
        Company.hasMany(models.application,{foreignKey: 'company_id',timestamps: false});
        Company.hasMany(models.developer,{foreignKey: 'company_id',timestamps: false});
    }


    return Company;
}