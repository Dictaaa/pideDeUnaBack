const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class User extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    User.belongsToMany(db.Role, {
      through: db.UserRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles',
    });

    User.hasMany(db.UserRole, {
  foreignKey: 'userId',
  as: 'userRoles',
});
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    // NULL = usuario global de PideDeUna (SUPER_ADMIN). Con restaurantId = pertenece a ese restaurante.
    restaurantId: { type: DataTypes.UUID, field: 'restaurant_id' },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.CITEXT, allowNull: false },
    phone: DataTypes.STRING(30),
    passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
    status: { type: DataTypes.STRING(30), defaultValue: 'active' }, // active | inactive | suspended
    lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
  },
  { sequelize, modelName: 'User', tableName: 'users', paranoid: true }
);

module.exports = User;
