const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class KitchenOrderItem extends Model {}

KitchenOrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderItemId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'order_item_id' },
    startedAt: { type: DataTypes.DATE, field: 'started_at' },
    readyAt: { type: DataTypes.DATE, field: 'ready_at' },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'KitchenOrderItem', tableName: 'kitchen_order_items', timestamps: true, updatedAt: false }
);

module.exports = KitchenOrderItem;
