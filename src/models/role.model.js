const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Role extends Model {
    // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Role.belongsToMany(db.User, {
  through: db.UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users',
});
Role.hasMany(db.UserRole, {
  foreignKey: 'roleId',
  as: 'userRoles',
});
Role.belongsToMany(db.Permission, {
  through: db.RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
  }
}

Role.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true }, // SUPER_ADMIN, RESTAURANT_ADMIN, MANAGER, WAITER, KITCHEN, CASHIER
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    isSystem: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_system' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'Role', tableName: 'roles', timestamps: true, updatedAt: false }
);

module.exports = Role;
