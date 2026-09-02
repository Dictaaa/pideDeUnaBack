const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OrderItem extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    OrderItem.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });
    OrderItem.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });
  }
}

OrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
    productId: { type: DataTypes.UUID, field: 'product_id' },
    // Snapshot histórico — NUNCA se recalculan desde products si el
    // producto cambia después. Ver order_items en pidedeuna_schema.sql.
    productName: { type: DataTypes.STRING(200), allowNull: false, field: 'product_name' },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1 } },
    unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    notes: DataTypes.TEXT,
    status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'OrderItem', tableName: 'order_items', timestamps: true }
);

module.exports = OrderItem;
