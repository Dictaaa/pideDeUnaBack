const { Review } = require('../models');

/** GET /api/restaurantes/:slug/reviews */
async function list(req, res) {
  const reviews = await Review.findAll({
    where: { restaurantId: req.restaurant.id },
    order: [['createdAt', 'DESC']],
  });
  return res.json(reviews);
}

/**
 * POST /api/restaurantes/:slug/reviews — la deja el cliente, no un admin.
 * body: { orderId?, customerId?, foodRating?, serviceRating?, experienceRating?, overallRating, comment? }
 */
async function create(req, res) {
  const { overallRating } = req.body;
  if (!overallRating) return res.status(400).json({ error: 'overallRating es obligatorio.' });

  const CREATABLE = ['orderId', 'customerId', 'foodRating', 'serviceRating', 'experienceRating', 'overallRating', 'comment'];
  const data = { restaurantId: req.restaurant.id };
  for (const f of CREATABLE) if (req.body[f] !== undefined) data[f] = req.body[f];

  try {
    const review = await Review.create(data);
    return res.status(201).json(review);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Las calificaciones deben estar entre 1 y 5.' });
    }
    throw err;
  }
}

module.exports = { list, create };
