const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MenuCategory extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    MenuCategory.belongsTo(db.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
    });
    MenuCategory.hasMany(db.Product, {
  foreignKey: 'categoryId',
  as: 'products',
});
  }
}

MenuCategory.init(
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
    description: DataTypes.TEXT,
    imageUrl: {
      type: DataTypes.TEXT,
      field: 'image_url',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
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
    modelName: 'MenuCategory',
    tableName: 'menu_categories',
    paranoid: true, // usa deleted_at como soft delete
  }
);

module.exports = MenuCategory;
