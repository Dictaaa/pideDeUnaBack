const { DataTypes,Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ModifierGroup extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    ModifierGroup.belongsToMany(db.Product, {
      through: db.ProductModifierGroup,
      foreignKey: 'modifierGroupId',
      otherKey: 'productId',
      as: 'products',
    });
    ModifierGroup.hasMany(db.Modifier, {
      foreignKey: 'modifierGroupId',
      as: 'modifiers',
    });
  }
}

ModifierGroup.init(
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
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    minSelections: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'min_selections',
    },
    maxSelections: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'max_selections',
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    }
  },
  {
    sequelize,
    modelName: 'ModifierGroup',
    tableName: 'modifier_groups',
  }
);

module.exports = ModifierGroup;
