const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Subscription extends Model {
// ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Subscription.belongsTo(db.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Subscription.belongsTo(db.Plan, { foreignKey: 'planId', as: 'plan' });
  }
}

Subscription.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    planId: { type: DataTypes.UUID, allowNull: false, field: 'plan_id' },
    status: { type: DataTypes.STRING(30), defaultValue: 'trial' }, // trial|active|past_due|cancelled|expired
    startedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'started_at' },
    expiresAt: { type: DataTypes.DATE, field: 'expires_at' },
    trialEndsAt: { type: DataTypes.DATE, field: 'trial_ends_at' },
    cancelledAt: { type: DataTypes.DATE, field: 'cancelled_at' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'Subscription', tableName: 'subscriptions' }
);

module.exports = Subscription;
