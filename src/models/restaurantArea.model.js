const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class RestaurantArea extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    RestaurantArea.belongsTo(db.Restaurant, { 
      foreignKey: 'restaurantId', as: 'restaurant' 
    });
  }
}

RestaurantArea.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    status: { type: DataTypes.STRING(30), defaultValue: 'active' }, // active | inactive
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'RestaurantArea', tableName: 'restaurant_areas', timestamps: false }
);

module.exports = RestaurantArea;
