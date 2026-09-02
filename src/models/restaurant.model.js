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
        validate: {
          is: /^[a-z0-9]+(-[a-z0-9]+)*$/,
        },
      },
      description: DataTypes.TEXT,
      logoUrl: {
        type: DataTypes.TEXT,
        field: 'logo_url',
      },
      coverUrl: {
        type: DataTypes.TEXT,
        field: 'cover_url',
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
      // Identidad de marca — lo que el admin del restaurante personaliza
      // desde su panel (ver menu-page/plantilla neutral del front).
      // Por defecto: naranja/amarillo de PideDeUna.
      primaryColor: {
        type: DataTypes.STRING(7),
        defaultValue: '#FF8A1E',
        field: 'primary_color',
        validate: {
          is: /^#[0-9A-Fa-f]{6}$/,
        },
      },
      secondaryColor: {
        type: DataTypes.STRING(7),
        defaultValue: '#FFC02E',
        field: 'secondary_color',
        validate: {
          is: /^#[0-9A-Fa-f]{6}$/,
        },
      },
      // Tipografía del nombre/descripción de producto en el menú público.
      // Catálogo cerrado a propósito (no texto libre).
      fontFamily: {
        type: DataTypes.STRING(30),
        defaultValue: 'inter',
        field: 'font_family',
        validate: {
          isIn: [['inter', 'fraunces', 'poppins', 'roboto-mono']],
        },
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
    },
  {
    sequelize,
    modelName: 'Restaurant',
    tableName: 'restaurants',
  }
);

module.exports = Restaurant;
