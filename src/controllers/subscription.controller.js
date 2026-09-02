const { Subscription, Plan } = require('../models');

/** GET /api/restaurantes/:slug/subscription — la suscripción activa/trial actual */
async function getCurrent(req, res) {
  const subscription = await Subscription.findOne({
    where: { restaurantId: req.restaurant.id, status: ['trial', 'active', 'past_due'] },
    include: [{ model: Plan, as: 'plan' }],
    order: [['createdAt', 'DESC']],
  });
  if (!subscription) return res.status(404).json({ error: 'Este restaurante no tiene una suscripción activa.' });
  return res.json(subscription);
}

/**
 * POST /api/restaurantes/:slug/subscription — cambia de plan.
 * body: { planId, status?, expiresAt? }
 * Cancela cualquier suscripción activa/trial anterior y crea una nueva
 * (mismo criterio que el índice único parcial en pidedeuna_schema.sql:
 * solo puede haber una activa/trial/past_due por restaurante a la vez).
 */
async function changePlan(req, res) {
  const { planId, status, expiresAt } = req.body;
  if (!planId) return res.status(400).json({ error: 'planId es obligatorio.' });

  const plan = await Plan.findByPk(planId);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });

  await Subscription.update(
    { status: 'cancelled', cancelledAt: new Date() },
    { where: { restaurantId: req.restaurant.id, status: ['trial', 'active', 'past_due'] } }
  );

  const subscription = await Subscription.create({
    restaurantId: req.restaurant.id,
    planId,
    status: status || 'active',
    expiresAt,
  });

  const fresh = await Subscription.findByPk(subscription.id, { include: [{ model: Plan, as: 'plan' }] });
  return res.status(201).json(fresh);
}

module.exports = { getCurrent, changePlan };
