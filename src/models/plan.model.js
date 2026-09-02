const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Plan extends Model {}

Plan.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(30), allowNull: false, unique: true }, // FREE, BASIC, PRO, PREMIUM
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    priceMonthly: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0, field: 'price_monthly' },
    maxTables: { type: DataTypes.INTEGER, field: 'max_tables' },
    maxUsers: { type: DataTypes.INTEGER, field: 'max_users' },
    maxProducts: { type: DataTypes.INTEGER, field: 'max_products' },
    maxPhotos: { type: DataTypes.INTEGER, field: 'max_photos' },
    maxVideos: { type: DataTypes.INTEGER, field: 'max_videos' },
    maxOrdersMonthly: { type: DataTypes.INTEGER, field: 'max_orders_monthly' },
    maxRestaurants: { type: DataTypes.INTEGER, defaultValue: 1, field: 'max_restaurants' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  { sequelize, modelName: 'Plan', tableName: 'plans', timestamps: true }
);

module.exports = Plan;
