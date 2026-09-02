const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Product extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Product.belongsTo(db.MenuCategory, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Product.belongsTo(db.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
    });
    Product.hasMany(db.ProductMedia, {
      foreignKey: 'productId',
      as: 'media',
    });
    Product.belongsToMany(db.Ingredient, {
      through: db.ProductIngredient,
      foreignKey: 'productId',
      otherKey: 'ingredientId',
      as: 'ingredients',
    });
    Product.belongsToMany(db.Allergen, {
      through: db.ProductAllergen,
      foreignKey: 'productId',
      otherKey: 'allergenId',
      as: 'allergens',
    });
    Product.belongsToMany(db.ModifierGroup, {
      through: db.ProductModifierGroup,
      foreignKey: 'productId',
      otherKey: 'modifierGroupId',
      as: 'modifierGroups',
    });
  }
}

Product.init(
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
    categoryId: {
      type: DataTypes.UUID,
      field: 'category_id',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.CITEXT,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    shortDescription: {
      type: DataTypes.STRING(300),
      field: 'short_description',
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.DECIMAL(12, 2),
      field: 'cost_price',
    },
    sku: DataTypes.STRING(60),
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available',
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_featured',
    },
    isRecommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recommended',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    preparationTimeMinutes: {
      type: DataTypes.INTEGER,
      field: 'preparation_time_minutes',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    paranoid: true,
  }
);

module.exports = Product;
