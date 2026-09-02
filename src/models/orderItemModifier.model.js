const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class OrderItemModifier extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    OrderItemModifier.belongsTo(db.OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
    OrderItemModifier.belongsTo(db.Modifier, { foreignKey: 'modifierId', as: 'modifier' });
  }
}

OrderItemModifier.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderItemId: { type: DataTypes.UUID, allowNull: false, field: 'order_item_id' },
    modifierId: { type: DataTypes.UUID, field: 'modifier_id' },
    modifierName: { type: DataTypes.STRING(120), allowNull: false, field: 'modifier_name' }, // snapshot
    unitPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0, field: 'unit_price' }, // snapshot
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'OrderItemModifier', tableName: 'order_item_modifiers', timestamps: true }
);

module.exports = OrderItemModifier;
