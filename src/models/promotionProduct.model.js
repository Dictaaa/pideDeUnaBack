const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PromotionProduct extends Model {}

PromotionProduct.init(
  {
    promotionId: { type: DataTypes.UUID, field: 'promotion_id', primaryKey: true },
    productId: { type: DataTypes.UUID, field: 'product_id', primaryKey: true },
  },
  { sequelize, modelName: 'PromotionProduct', tableName: 'promotion_products', timestamps: false }
);

module.exports = PromotionProduct;
