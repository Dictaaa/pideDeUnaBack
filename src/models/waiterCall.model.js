const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class WaiterCall extends Model {}

WaiterCall.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    tableId: { type: DataTypes.UUID, allowNull: false, field: 'table_id' },
    tableSessionId: { type: DataTypes.UUID, field: 'table_session_id' },
    callType: { type: DataTypes.STRING(30), defaultValue: 'CALL_WAITER', field: 'call_type' },
    status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    attendedAt: { type: DataTypes.DATE, field: 'attended_at' },
    attendedByUserId: { type: DataTypes.UUID, field: 'attended_by_user_id' },
  },
  { sequelize, modelName: 'WaiterCall', tableName: 'waiter_calls', timestamps: true, updatedAt: false }
);

module.exports = WaiterCall;
