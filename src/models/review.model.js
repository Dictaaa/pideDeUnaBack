const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Review extends Model {}

Review.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderId: { type: DataTypes.UUID, field: 'order_id' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    foodRating: { type: DataTypes.SMALLINT, field: 'food_rating', validate: { min: 1, max: 5 } },
    serviceRating: { type: DataTypes.SMALLINT, field: 'service_rating', validate: { min: 1, max: 5 } },
    experienceRating: { type: DataTypes.SMALLINT, field: 'experience_rating', validate: { min: 1, max: 5 } },
    overallRating: { type: DataTypes.SMALLINT, allowNull: false, field: 'overall_rating', validate: { min: 1, max: 5 } },
    comment: DataTypes.TEXT,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
  },
  { sequelize, modelName: 'Review', tableName: 'reviews', timestamps: true, updatedAt: false }
);

module.exports = Review;
