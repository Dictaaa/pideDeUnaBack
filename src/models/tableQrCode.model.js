const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class TableQrCode extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    TableQrCode.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    TableQrCode.belongsTo(db.Table, { foreignKey: 'tableId', as: 'table' });
  }
}

TableQrCode.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    tableId: { type: DataTypes.UUID, allowNull: false, field: 'table_id' },
    token: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'TableQrCode', tableName: 'table_qr_codes' }
);

module.exports = TableQrCode;
