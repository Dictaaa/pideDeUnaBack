const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class RestaurantSetting extends Model {}

RestaurantSetting.init(
  {
    restaurantId: { type: DataTypes.UUID, field: 'restaurant_id', primaryKey: true },
    acceptOrders: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'accept_orders' },
    acceptReservations: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'accept_reservations' },
    allowCustomerOrdering: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'allow_customer_ordering' },
    allowWaiterCalls: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'allow_waiter_calls' },
    allowOnlinePayment: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'allow_online_payment' },
    allowTips: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'allow_tips' },
    showPrices: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_prices' },
    showVideos: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_videos' },
    showAllergens: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_allergens' },
    showIngredients: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_ingredients' },
    openingHours: { type: DataTypes.JSONB, field: 'opening_hours' },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  { sequelize, modelName: 'RestaurantSetting', tableName: 'restaurant_settings', timestamps: true, createdAt: false }
);

module.exports = RestaurantSetting;
