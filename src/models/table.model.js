const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// Se llama "Table" el modelo (la tabla SQL también es "tables"); ojo al
// importar, puede confundirse con el tipo Table de JS — usar siempre
// require('./table.model') explícito.
class Table extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Table.belongsTo(db.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
    });
    Table.belongsTo(db.RestaurantArea, {
      foreignKey: 'areaId',
      as: 'area',
    });
    Table.hasMany(db.TableQrCode, {
      foreignKey: 'tableId',
      as: 'qrCodes',
    });
  }
}

Table.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    areaId: { type: DataTypes.UUID, field: 'area_id' },
    tableNumber: { type: DataTypes.STRING(30), allowNull: false, field: 'table_number' },
    name: DataTypes.STRING(100),
    capacity: { type: DataTypes.INTEGER, defaultValue: 4, validate: { min: 1 } },
    status: { type: DataTypes.STRING(30), defaultValue: 'AVAILABLE' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    deletedAt: { type: DataTypes.DATE, field: 'deleted_at' },
  },
  { sequelize, modelName: 'Table', tableName: 'tables', paranoid: true }
);

module.exports = Table;
