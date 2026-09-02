const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Promotion extends Model {}

Promotion.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: DataTypes.TEXT,
    promoType: { type: DataTypes.STRING(30), allowNull: false, field: 'promo_type' }, // percentage|fixed_amount|buy_x_get_y
    percentage: DataTypes.DECIMAL(5, 2),
    fixedAmount: { type: DataTypes.DECIMAL(12, 2), field: 'fixed_amount' },
    buyQuantity: { type: DataTypes.INTEGER, field: 'buy_quantity' },
    getQuantity: { type: DataTypes.INTEGER, field: 'get_quantity' },
    startDate: { type: DataTypes.DATEONLY, field: 'start_date' },
    endDate: { type: DataTypes.DATEONLY, field: 'end_date' },
    startTime: { type: DataTypes.TIME, field: 'start_time' },
    endTime: { type: DataTypes.TIME, field: 'end_time' },
    daysOfWeek: { type: DataTypes.ARRAY(DataTypes.SMALLINT), field: 'days_of_week' },
    maxUses: { type: DataTypes.INTEGER, field: 'max_uses' },
    usesCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'uses_count' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'Promotion', tableName: 'promotions', timestamps: true }
);

module.exports = Promotion;
