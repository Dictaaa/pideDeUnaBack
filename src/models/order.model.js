const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Order extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Order.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Order.belongsTo(db.Table, { foreignKey: 'tableId', as: 'table' });
    Order.belongsTo(db.TableSession, { foreignKey: 'tableSessionId', as: 'tableSession' });
    Order.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });
    Order.belongsTo(db.User, { foreignKey: 'createdByUserId', as: 'createdByUser' });
    Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'items' });
  }
}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    tableId: { type: DataTypes.UUID, field: 'table_id' },
    tableSessionId: { type: DataTypes.UUID, field: 'table_session_id' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    customerName: { type: DataTypes.STRING(150), field: 'customer_name' },
    createdByUserId: { type: DataTypes.UUID, field: 'created_by_user_id' },
    orderNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'order_number' },
    orderType: { type: DataTypes.STRING(30), defaultValue: 'DINE_IN', field: 'order_type' },
    status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },
    subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    tip: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    notes: DataTypes.TEXT,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
    cancelledAt: { type: DataTypes.DATE, field: 'cancelled_at' },
  },
  { sequelize, modelName: 'Order', tableName: 'orders', timestamps: true }
);

module.exports = Order;
