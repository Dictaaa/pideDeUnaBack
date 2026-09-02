const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class RolePermission extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    RolePermission.belongsTo(db.Role, { foreignKey: 'roleId', as: 'role' });
    RolePermission.belongsTo(db.Permission, { foreignKey: 'permissionId', as: 'permission' });
  }
}

RolePermission.init(
  {
    roleId: { type: DataTypes.UUID, field: 'role_id', primaryKey: true },
    permissionId: { type: DataTypes.UUID, field: 'permission_id', primaryKey: true },
  },
  { sequelize, modelName: 'RolePermission', tableName: 'role_permissions', timestamps: false }
);

module.exports = RolePermission;
