const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Restaurant extends Model {
  // ── Asociaciones ──────────────────────────────────────
  static associate(db) {
    Restaurant.hasMany(db.MenuCategory, {
  foreignKey: 'restaurantId',
  as: 'categories',
});
Restaurant.hasMany(db.Product, {
  foreignKey: 'restaurantId',
  as: 'products',
});
  }
}

Restaurant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.CITEXT,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
    logoUrl: {
  type: DataTypes.TEXT,
  field: 'logo_url'
},

coverUrl: {
  type: DataTypes.TEXT,
  field: 'cover_url'
},
    phone: DataTypes.STRING(30),
    email: DataTypes.STRING(150),
    address: DataTypes.TEXT,
    city: DataTypes.STRING(100),
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'Colombia',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'COP',
    },
    timezone: {
      type: DataTypes.STRING(100),
      defaultValue: 'America/Bogota',
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'active', // active | suspended | trial | cancelled
    },
  },
  {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
  }
);

module.exports = Restaurant;
