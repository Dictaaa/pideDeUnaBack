const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Reservation extends Model {}

Reservation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    restaurantId: { type: DataTypes.UUID, allowNull: false, field: 'restaurant_id' },
    customerId: { type: DataTypes.UUID, field: 'customer_id' },
    tableId: { type: DataTypes.UUID, field: 'table_id' },
    customerName: { type: DataTypes.STRING(150), allowNull: false, field: 'customer_name' },
    customerPhone: { type: DataTypes.STRING(30), field: 'customer_phone' },
    reservationDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'reservation_date' },
    reservationTime: { type: DataTypes.TIME, allowNull: false, field: 'reservation_time' },
    guestCount: { type: DataTypes.INTEGER, defaultValue: 1, field: 'guest_count', validate: { min: 1 } },
    status: { type: DataTypes.STRING(30), defaultValue: 'PENDING' },
    notes: DataTypes.TEXT,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  { sequelize, modelName: 'Reservation', tableName: 'reservations', timestamps: true }
);

module.exports = Reservation;
