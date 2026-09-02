const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class TableSession extends Model {}

TableSession.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    tableId: { type: DataTypes.UUID, allowNull: false, field: 'table_id' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    guestCount: { type: DataTypes.INTEGER, field: 'guest_count' },
    status: { type: DataTypes.STRING(30), defaultValue: 'OPEN' }, // OPEN | CLOSED
    openedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'opened_at' },
    closedAt: { type: DataTypes.DATE, field: 'closed_at' },
  },
  { sequelize, modelName: 'TableSession', tableName: 'table_sessions', timestamps: false }
);

module.exports = TableSession;
