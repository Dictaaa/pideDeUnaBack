const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Tip extends Model {}

Tip.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
    tipType: { type: DataTypes.STRING(20), allowNull: false, field: 'tip_type' }, // percentage | fixed_amount
    percentage: DataTypes.DECIMAL(5, 2),
    fixedAmount: { type: DataTypes.DECIMAL(12, 2), field: 'fixed_amount' },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'Tip', tableName: 'tips', timestamps: true, updatedAt: false }
);

module.exports = Tip;
