const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Payment extends Model {}

Payment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    orderId: { type: DataTypes.UUID, allowNull: false, field: 'order_id' },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), defaultValue: 'COP' },
    paymentMethod: { type: DataTypes.STRING(30), allowNull: false, field: 'payment_method' }, // CASH|CARD|TRANSFER|WOMPI|EPAYCO|OTHER
    status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },
    transactionReference: { type: DataTypes.STRING(150), field: 'transaction_reference' },
    paidAt: { type: DataTypes.DATE, field: 'paid_at' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'Payment', tableName: 'payments', timestamps: true }
);

module.exports = Payment;
