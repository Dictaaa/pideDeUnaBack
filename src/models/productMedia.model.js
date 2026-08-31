const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ProductMedia extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    ProductMedia.belongsTo(db.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  }
}

ProductMedia.init(
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
    },
    mediaType: {
      type: DataTypes.STRING(20), // IMAGE | VIDEO
      allowNull: false,
      field: 'media_type',
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.TEXT,
      field: 'thumbnail_url',
    },
    altText: {
      type: DataTypes.STRING(200),
      field: 'alt_text',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_primary',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'ProductMedia',
    tableName: 'product_media',
    timestamps: true,
    updatedAt: false, // la tabla solo tiene created_at
  }
);

module.exports = ProductMedia;
