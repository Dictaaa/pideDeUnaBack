const { DataTypes,Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Ingredient extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Ingredient.belongsToMany(db.Product, {
  through: db.ProductIngredient,
  foreignKey: 'ingredientId',
  otherKey: 'productId',
  as: 'products',
});
  }
}

Ingredient.init(
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
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Ingredient',
    tableName: 'ingredients',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Ingredient;
