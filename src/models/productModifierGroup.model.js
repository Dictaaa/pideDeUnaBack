const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ProductModifierGroup extends Model {}

ProductModifierGroup.init(
  {
    productId: {
      type: DataTypes.UUID,
      field: 'product_id',
      primaryKey: true,
    },
    modifierGroupId: {
      type: DataTypes.UUID,
      field: 'modifier_group_id',
      primaryKey: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    sequelize,
    modelName: 'ProductModifierGroup',
    tableName: 'product_modifier_groups',
    timestamps: false,
  }
);

module.exports = ProductModifierGroup;
