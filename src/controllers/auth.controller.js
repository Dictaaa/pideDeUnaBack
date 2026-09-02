const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Restaurant } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  console.warn('⚠ JWT_SECRET no está configurado en .env — el login va a fallar hasta que lo definas.');
}

function issueToken(user, roleCodes, restaurantId) {
  return jwt.sign({ sub: user.id, restaurantId: restaurantId || null, roles: roleCodes }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * POST /api/auth/login
 * body: { email, password }
 * Login único para toda la plataforma — el email ya es único
 * globalmente (ver migración 003_email_unico_global.sql), así que no
 * hace falta pedir el slug del restaurante. Sirve tanto para staff de
 * un restaurante (restaurantId presente) como para el SUPER_ADMIN de
 * PideDeUna (restaurantId null).
 */
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios.' });
  }

  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'roles' }],
  });

  const ok = user && user.status === 'active' && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    // Mensaje genérico a propósito: no revelar si el email existe o no.
    return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
  }

  await user.update({ lastLoginAt: new Date() });

  let restaurantPayload = null;
  if (user.restaurantId) {
    const restaurant = await Restaurant.findByPk(user.restaurantId, { attributes: ['id', 'slug', 'name'] });
    if (restaurant) restaurantPayload = { id: restaurant.id, slug: restaurant.slug, name: restaurant.name };
  }

  const roleCodes = user.roles.map((r) => r.code);
  const token = issueToken(user, roleCodes, user.restaurantId);

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, roles: roleCodes },
    restaurant: restaurantPayload,
  });
}

module.exports = { login };
