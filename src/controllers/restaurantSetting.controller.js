const { RestaurantSetting } = require('../models');

/** GET /api/restaurantes/:slug/settings */
async function get(req, res) {
  let settings = await RestaurantSetting.findByPk(req.restaurant.id);
  if (!settings) {
    // No debería pasar (el seed las crea al crear el restaurante), pero
    // por si acaso: se crean con los defaults la primera vez que se piden.
    settings = await RestaurantSetting.create({ restaurantId: req.restaurant.id });
  }
  return res.json(settings);
}

/** PATCH /api/restaurantes/:slug/settings */
async function update(req, res) {
  let settings = await RestaurantSetting.findByPk(req.restaurant.id);
  if (!settings) settings = await RestaurantSetting.create({ restaurantId: req.restaurant.id });

  const EDITABLE = [
    'acceptOrders', 'acceptReservations', 'allowCustomerOrdering', 'allowWaiterCalls',
    'allowOnlinePayment', 'allowTips', 'showPrices', 'showVideos', 'showAllergens',
    'showIngredients', 'openingHours',
  ];
  const updates = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) updates[f] = req.body[f];

  await settings.update(updates);
  return res.json(settings);
}

module.exports = { get, update };
