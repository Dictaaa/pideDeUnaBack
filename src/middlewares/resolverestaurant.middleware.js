const { Restaurant } = require('../models');

/**
 * Resuelve :slug en la URL a un restaurante real y lo deja en
 * req.restaurant, para que ningún controller tenga que repetir el
 * mismo findOne + manejo de 404. Todas las rutas anidadas bajo
 * /api/restaurantes/:slug/... lo usan.
 */
async function resolveRestaurant(req, res, next) {
  try {
    const { slug } = req.params;
    const restaurant = await Restaurant.findOne({ where: { slug } });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado.' });
    }

    // Cubre tanto al staff con sesión ya iniciada (el login ya bloquea
    // el inicio de sesión nuevo) como al menú público — un restaurante
    // suspendido no debe seguir operando ni visible, en ningún punto.
    if (restaurant.status === 'suspended' || restaurant.status === 'cancelled') {
      return res.status(403).json({ error: 'Este restaurante no está disponible en este momento.' });
    }

    req.restaurant = restaurant;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = resolveRestaurant;