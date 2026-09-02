const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Customer extends Model {}

Customer.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    name: DataTypes.STRING(150),
    phone: DataTypes.STRING(30),
    email: DataTypes.CITEXT,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'Customer', tableName: 'customers', timestamps: true }
);

module.exports = Customer;
