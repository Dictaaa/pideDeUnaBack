const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ProductAllergen extends Model {}

ProductAllergen.init(
  {
    productId: {
      type: DataTypes.UUID,
      field: 'product_id',
      primaryKey: true,
    },
    allergenId: {
      type: DataTypes.UUID,
      field: 'allergen_id',
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'ProductAllergen',
    tableName: 'product_allergens',
    timestamps: false,
  }
);

module.exports = ProductAllergen;
