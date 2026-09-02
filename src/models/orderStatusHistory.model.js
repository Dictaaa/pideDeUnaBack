const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OrderStatusHistory extends Model {}

OrderStatusHistory.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
    oldStatus: { type: DataTypes.STRING(30), field: 'old_status' },
    newStatus: { type: DataTypes.STRING(30), allowNull: false, field: 'new_status' },
    changedByUserId: { type: DataTypes.UUID, field: 'changed_by_user_id' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'OrderStatusHistory', tableName: 'order_status_history', timestamps: true, updatedAt: false }
);

module.exports = OrderStatusHistory;
