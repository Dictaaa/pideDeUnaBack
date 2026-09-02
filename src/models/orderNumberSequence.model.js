const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// PK = restaurant_id (una fila por restaurante). Se actualiza con
// INSERT ... ON CONFLICT DO UPDATE desde order.service.js, nunca a mano.
class OrderNumberSequence extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    OrderNumberSequence.belongsTo(db.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
    });
  }
}

OrderNumberSequence.init(
  {
    restaurantId: { type: DataTypes.UUID, field: 'restaurant_id', primaryKey: true },
    lastNumber: { type: DataTypes.INTEGER, defaultValue: 0, field: 'last_number' },
  },
  { sequelize, modelName: 'OrderNumberSequence', tableName: 'order_number_sequences', timestamps: false }
);

module.exports = OrderNumberSequence;
