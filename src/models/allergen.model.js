const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

// Catálogo global: se comparte entre restaurantes (no tiene restaurant_id).
class Allergen extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Allergen.belongsToMany(db.Product, {
  through: db.ProductAllergen,
  foreignKey: 'allergenId',
  otherKey: 'productId',
  as: 'products',
});
  }
}

Allergen.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    iconUrl: {
      type: DataTypes.TEXT,
      field: 'icon_url',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    }
  },
  {
    sequelize,
    modelName:  'Allergen',
    tableName:  'allergens',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Allergen;
