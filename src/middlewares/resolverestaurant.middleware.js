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

    req.restaurant = restaurant;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = resolveRestaurant;