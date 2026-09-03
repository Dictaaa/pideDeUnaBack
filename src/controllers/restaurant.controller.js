const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  Restaurant,
  User,
  Role,
  UserRole,
  Plan,
  Subscription,
  RestaurantSetting,
} = require('../models');
const storageService = require('../services/storage.service');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function issueAuthToken(user, roleCodes, restaurantId) {
  return jwt.sign({ sub: user.id, restaurantId: restaurantId || null, roles: roleCodes }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

const PUBLIC_ATTRS = [
  'id',
  'name',
  'slug',
  'description',
  'logoUrl',
  'coverUrl',
  'phone',
  'email',
  'address',
  'city',
  'country',
  'currency',
  'timezone',
  'primaryColor',
  'secondaryColor',
  'fontFamily',
];

/** GET /api/restaurantes/:slug — perfil público (incluye colores de marca) */
async function getProfile(req, res) {
  const restaurant = await Restaurant.findByPk(req.restaurant.id, { attributes: PUBLIC_ATTRS });
  return res.json(restaurant);
}

/**
 * PATCH /api/restaurantes/:slug — actualiza perfil y/o marca.
 * Pensado para el panel de administrador del restaurante:
 * { name, description, logoUrl, coverUrl, phone, email, address, city,
 *   primaryColor, secondaryColor }
 */
async function updateProfile(req, res) {
  const restaurant = req.restaurant;

  const EDITABLE_FIELDS = [
    'name',
    'description',
    'logoUrl',
    'coverUrl',
    'phone',
    'email',
    'address',
    'city',
    'primaryColor',
    'secondaryColor',
    'fontFamily',
  ];

  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  try {
    await restaurant.update(updates);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    throw err;
  }

  const fresh = await Restaurant.findByPk(restaurant.id, { attributes: PUBLIC_ATTRS });
  return res.json(fresh);
}

/**
 * POST /api/restaurantes/register — PÚBLICO, sin auth (así se registra
 * un restaurante nuevo en PideDeUna).
 * body: { restaurantName, slug, adminName, adminEmail, adminPassword }
 * Crea: el restaurante (con colores default), su configuración, una
 * suscripción FREE en trial, y el primer usuario con rol RESTAURANT_ADMIN.
 * Devuelve el mismo shape que el login ({ token, user, restaurant }) para
 * poder loguear automáticamente justo después de registrarse.
 */
async function register(req, res) {
  const { restaurantName, slug, adminName, adminEmail, adminPassword } = req.body;

  if (!restaurantName || !slug || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({
      error: 'restaurantName, slug, adminName, adminEmail y adminPassword son obligatorios.',
    });
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return res.status(400).json({ error: 'El slug solo puede tener minúsculas, números y guiones.' });
  }
  if (adminPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const existing = await Restaurant.findOne({ where: { slug } });
  if (existing) {
    return res.status(409).json({ error: 'Ese slug ya está en uso. Prueba con otro.' });
  }

  const restaurant = await Restaurant.create({ name: restaurantName, slug, status: 'trial' });
  await RestaurantSetting.create({ restaurantId: restaurant.id });

  // Ningún plan es gratis: el registro arranca en trial de 14 días
  // sobre el plan más económico disponible (no hay un plan "FREE").
  const startingPlan = await Plan.findOne({ where: { isActive: true }, order: [['priceMonthly', 'ASC']] });
  if (startingPlan) {
    await Subscription.create({
      restaurantId: restaurant.id,
      planId: startingPlan.id,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({
    restaurantId: restaurant.id,
    name: adminName,
    email: adminEmail,
    passwordHash,
  });

  const adminRole = await Role.findOne({ where: { code: 'RESTAURANT_ADMIN' } });
  if (adminRole) {
    await UserRole.create({ userId: admin.id, roleId: adminRole.id, restaurantId: restaurant.id });
  }

  const token = issueAuthToken(admin, adminRole ? ['RESTAURANT_ADMIN'] : [], restaurant.id);

  return res.status(201).json({
    token,
    user: { id: admin.id, name: admin.name, email: admin.email, roles: adminRole ? ['RESTAURANT_ADMIN'] : [] },
    restaurant: { id: restaurant.id, slug: restaurant.slug, name: restaurant.name },
  });
}

/**
 * POST /api/restaurantes/:slug/logo — multipart/form-data, campo "file".
 * Sube el logo a Supabase (reutiliza storage.service.js, mismo que
 * usan las fotos/videos de producto) y actualiza restaurant.logoUrl.
 * Protegido: solo el admin del propio restaurante (o SUPER_ADMIN).
 */
async function uploadLogo(req, res) {
  const restaurant = req.restaurant;

  if (!req.file) {
    return res.status(400).json({ error: 'Falta el archivo (campo "file").' });
  }

  const folder = `${restaurant.slug}/branding`;
  let url;
  try {
    url = await storageService.uploadImage(req.file, folder);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  await restaurant.update({ logoUrl: url });

  const fresh = await Restaurant.findByPk(restaurant.id, { attributes: PUBLIC_ATTRS });
  return res.json(fresh);
}

module.exports = { getProfile, updateProfile, register, uploadLogo };