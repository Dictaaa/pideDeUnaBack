const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// Tabla de unión pura (product_id + ingredient_id como PK compuesta),
// no necesita id propio ni timestamps.
class ProductIngredient extends Model {}

ProductIngredient.init(
  {
    productId: {
      type: DataTypes.UUID,
      field: 'product_id',
      primaryKey: true,
    },
    ingredientId: {
      type: DataTypes.UUID,
      field: 'ingredient_id',
      primaryKey: true,
    }
  },
  {
    sequelize,
    modelName: 'ProductIngredient',
    tableName: 'product_ingredients',
    timestamps: false,
  }
);

module.exports = ProductIngredient;
