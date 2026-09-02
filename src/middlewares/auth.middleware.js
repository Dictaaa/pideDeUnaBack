const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Exige un Bearer token válido. Si pasa, deja en req.user:
 *   { id, restaurantId, roles: ['RESTAURANT_ADMIN', ...] }
 * NO valida que req.user.restaurantId coincida con el :slug de la URL
 * — eso lo hace requireSameRestaurant (van juntos casi siempre).
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token de autenticación (header Authorization: Bearer <token>).' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, restaurantId: payload.restaurantId, roles: payload.roles };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

/**
 * Exige que el usuario autenticado tenga uno de los roles dados.
 * Uso: router.post('/', authenticate, authorize('RESTAURANT_ADMIN'), ctrl.create)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({ error: 'No tienes permiso para hacer esto.' });
    }
    next();
  };
}

/**
 * Exige que el usuario autenticado pertenezca AL MISMO restaurante que
 * el :slug de la URL (req.restaurant, ya resuelto por
 * resolveRestaurant.middleware.js). SUPER_ADMIN se salta esta regla:
 * administra cualquier restaurante.
 * Va DESPUÉS de authenticate y de resolveRestaurant en la cadena.
 */
function requireSameRestaurant(req, res, next) {
  if (req.user.roles.includes('SUPER_ADMIN')) return next();

  if (!req.restaurant || req.user.restaurantId !== req.restaurant.id) {
    return res.status(403).json({ error: 'No tienes acceso a este restaurante.' });
  }
  next();
}

module.exports = { authenticate, authorize, requireSameRestaurant };
