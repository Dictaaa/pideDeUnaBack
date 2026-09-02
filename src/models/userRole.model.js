const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// A diferencia de las otras tablas de unión, esta SÍ tiene id propio y
// restaurant_id, porque un mismo usuario puede tener el mismo rol en
// restaurantes distintos (o ninguno, si es SUPER_ADMIN).
class UserRole extends Model {
   // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    UserRole.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user',
});
    UserRole.belongsTo(db.Role, {
  foreignKey: 'roleId',
  as: 'role',
});
  }
}

UserRole.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    roleId: { type: DataTypes.UUID, allowNull: false, field: 'role_id' },
    restaurantId: { type: DataTypes.UUID, field: 'restaurant_id' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'UserRole', tableName: 'user_roles', timestamps: true, updatedAt: false }
);

module.exports = UserRole;
