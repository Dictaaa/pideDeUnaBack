const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Modifier extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Modifier.belongsTo(db.ModifierGroup, {
      foreignKey: 'modifierGroupId',
      as: 'modifierGroup',
    });
  }
}

Modifier.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'restaurant_id',
    },
    modifierGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'modifier_group_id',
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Modifier',
    tableName: 'modifiers',
  }
);

module.exports = Modifier;
