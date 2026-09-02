const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Permission extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Permission.belongsToMany(db.Role, {
      through: db.RolePermission,
      foreignKey: 'permissionId',
      otherKey: 'roleId',
      as: 'roles',
    });
  }
}

Permission.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(100), allowNull: false, unique: true }, // ej: products.create
    description: DataTypes.TEXT,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'Permission', tableName: 'permissions', timestamps: true, updatedAt: false }
);

module.exports = Permission;
