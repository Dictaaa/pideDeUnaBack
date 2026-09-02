const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, field: 'restaurant_id' },
    userId: { type: DataTypes.UUID, field: 'user_id' },
    action: { type: DataTypes.STRING(100), allowNull: false },
    entityType: { type: DataTypes.STRING(60), allowNull: false, field: 'entity_type' },
    entityId: { type: DataTypes.UUID, field: 'entity_id' },
    oldValues: { type: DataTypes.JSONB, field: 'old_values' },
    newValues: { type: DataTypes.JSONB, field: 'new_values' },
    ipAddress: { type: DataTypes.INET, field: 'ip_address' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'AuditLog', tableName: 'audit_logs', timestamps: true, updatedAt: false }
);

module.exports = AuditLog;
