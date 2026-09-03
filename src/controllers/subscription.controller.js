const { Subscription, Plan, MenuCategory, Product, Table, User, ProductMedia } = require('../models');
const { getActiveSubscription } = require('../middlewares/planLimit.middleware');

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

module.exports = { getCurrent, changePlan, getUsage };

/**
 * GET /api/restaurantes/:slug/subscription/usage
 * Cuánto de cada límite del plan ya se usó — lo consume la pantalla
 * de Plan del admin para mostrar barras de progreso y avisar antes
 * de que el 403 de enforcePlanLimit lo sorprenda a mitad de un formulario.
 */
async function getUsage(req, res) {
  const subscription = await getActiveSubscription(req.restaurant.id);
  if (!subscription || !subscription.plan) {
    return res.status(404).json({ error: 'Este restaurante no tiene una suscripción activa.' });
  }

  const restaurantId = req.restaurant.id;
  const [categories, products, tables, users, photos, videos] = await Promise.all([
    MenuCategory.count({ where: { restaurantId } }),
    Product.count({ where: { restaurantId } }),
    Table.count({ where: { restaurantId } }),
    User.count({ where: { restaurantId } }),
    ProductMedia.count({ where: { restaurantId, mediaType: 'IMAGE' } }),
    ProductMedia.count({ where: { restaurantId, mediaType: 'VIDEO' } }),
  ]);

  const plan = subscription.plan;
  return res.json({
    subscription: {
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      trialEndsAt: subscription.trialEndsAt,
    },
    plan,
    usage: {
      categories: { used: categories, limit: plan.maxCategories },
      products: { used: products, limit: plan.maxProducts },
      tables: { used: tables, limit: plan.maxTables },
      users: { used: users, limit: plan.maxUsers },
      photos: { used: photos, limit: plan.maxPhotos },
      videos: { used: videos, limit: plan.maxVideos },
    },
  });
}