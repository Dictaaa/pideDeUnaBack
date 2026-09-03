const bcrypt = require('bcryptjs');
const {
  Restaurant,
  RestaurantSetting,
  Subscription,
  Plan,
  User,
  Role,
  UserRole,
  MenuCategory,
  Product,
  Table,
  ProductMedia,
} = require('../models');

const RESTAURANT_STATUSES = ['trial', 'active', 'suspended', 'cancelled'];

/** Trae la suscripción vigente (o la más reciente) de un restaurante, con su plan. */
async function currentSubscriptionFor(restaurantId) {
  return Subscription.findOne({
    where: { restaurantId },
    include: [{ model: Plan, as: 'plan' }],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * GET /api/super-admin/restaurants?search=texto
 * Vista de lista: cada restaurante con su plan y estado de un vistazo.
 */
async function listRestaurants(req, res) {
  const { search } = req.query;
  const where = {};
  if (search) {
    const { Op } = require('sequelize');
    where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { slug: { [Op.iLike]: `%${search}%` } }];
  }

  const restaurants = await Restaurant.findAll({ where, order: [['createdAt', 'DESC']] });

  // N+1 aceptado aquí: es una pantalla de administración interna, no
  // el menú público — el volumen de restaurantes no justifica el JOIN
  // complejo todavía.
  const withSubscriptions = await Promise.all(
    restaurants.map(async (r) => {
      const subscription = await currentSubscriptionFor(r.id);
      const usersCount = await User.count({ where: { restaurantId: r.id } });
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        status: r.status,
        city: r.city,
        createdAt: r.createdAt,
        plan: subscription?.plan ? { id: subscription.plan.id, name: subscription.plan.name, code: subscription.plan.code } : null,
        subscriptionStatus: subscription?.status ?? null,
        usersCount,
      };
    })
  );

  return res.json(withSubscriptions);
}

/** GET /api/super-admin/restaurants/:id — detalle completo. */
async function getRestaurant(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const subscription = await currentSubscriptionFor(restaurant.id);

  const users = await User.findAll({
    where: { restaurantId: restaurant.id },
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
    attributes: ['id', 'name', 'email', 'status', 'createdAt'],
  });

  const [categories, products, tables, photos, videos] = await Promise.all([
    MenuCategory.count({ where: { restaurantId: restaurant.id } }),
    Product.count({ where: { restaurantId: restaurant.id } }),
    Table.count({ where: { restaurantId: restaurant.id } }),
    ProductMedia.count({ where: { restaurantId: restaurant.id, mediaType: 'IMAGE' } }),
    ProductMedia.count({ where: { restaurantId: restaurant.id, mediaType: 'VIDEO' } }),
  ]);

  return res.json({
    restaurant,
    subscription,
    users,
    usage: { categories, products, tables, users: users.length, photos, videos },
  });
}

/**
 * POST /api/super-admin/restaurants
 * El super admin da de alta un restaurante nuevo — a diferencia del
 * registro público (/restaurantes/register), acá puede elegir el plan
 * y el estado inicial de una vez (ej. "active" directo, sin trial, si
 * ya cerraron el trato por fuera).
 */
async function createRestaurant(req, res) {
  const { restaurantName, slug, adminName, adminEmail, adminPassword, planId, status } = req.body;

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
  if (existing) return res.status(409).json({ error: 'Ese slug ya está en uso.' });

  const existingEmail = await User.findOne({ where: { email: adminEmail } });
  if (existingEmail) return res.status(409).json({ error: 'Ese correo ya está registrado en otra cuenta.' });

  const restaurantStatus = RESTAURANT_STATUSES.includes(status) ? status : 'trial';
  const restaurant = await Restaurant.create({ name: restaurantName, slug, status: restaurantStatus });
  await RestaurantSetting.create({ restaurantId: restaurant.id });

  const plan = planId
    ? await Plan.findByPk(planId)
    : await Plan.findOne({ where: { isActive: true }, order: [['priceMonthly', 'ASC']] });

  if (plan) {
    await Subscription.create({
      restaurantId: restaurant.id,
      planId: plan.id,
      status: restaurantStatus === 'trial' ? 'trial' : 'active',
      trialEndsAt: restaurantStatus === 'trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.create({ restaurantId: restaurant.id, name: adminName, email: adminEmail, passwordHash });

  const adminRole = await Role.findOne({ where: { code: 'RESTAURANT_ADMIN' } });
  if (adminRole) {
    await UserRole.create({ userId: admin.id, roleId: adminRole.id, restaurantId: restaurant.id });
  }

  return res.status(201).json({ restaurant, admin: { id: admin.id, name: admin.name, email: admin.email } });
}

/** PATCH /api/super-admin/restaurants/:id — nombre y/o slug. */
async function updateRestaurant(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const { name, slug } = req.body;

  if (slug && slug !== restaurant.slug) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ error: 'El slug solo puede tener minúsculas, números y guiones.' });
    }
    const clash = await Restaurant.findOne({ where: { slug } });
    if (clash) return res.status(409).json({ error: 'Ese slug ya está en uso.' });
  }

  await restaurant.update({
    name: name ?? restaurant.name,
    slug: slug ?? restaurant.slug,
  });

  return res.json(restaurant);
}

/**
 * POST /api/super-admin/restaurants/:id/status
 * body: { status: 'trial'|'active'|'suspended'|'cancelled' }
 * Esto es lo que usa el botón de deshabilitar/habilitar — un restaurante
 * 'suspended' sigue existiendo con todos sus datos, solo que su panel
 * y su menú público dejan de estar disponibles (lo aplican los
 * middlewares de auth/resolveRestaurant, no se borra nada).
 */
async function setRestaurantStatus(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const { status } = req.body;
  if (!RESTAURANT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Estado inválido. Usa uno de: ${RESTAURANT_STATUSES.join(', ')}.` });
  }

  await restaurant.update({ status });
  return res.json(restaurant);
}

/**
 * POST /api/super-admin/restaurants/:id/plan
 * body: { planId }
 * Igual que subscription.controller.changePlan, pero sin necesitar
 * estar autenticado COMO ese restaurante — el super admin lo hace
 * desde afuera, para cualquier restaurante, por su id.
 */
async function changeRestaurantPlan(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const { planId } = req.body;
  const plan = await Plan.findByPk(planId);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });

  await Subscription.update(
    { status: 'cancelled', cancelledAt: new Date() },
    { where: { restaurantId: restaurant.id, status: ['trial', 'active', 'past_due'] } }
  );

  const subscription = await Subscription.create({
    restaurantId: restaurant.id,
    planId: plan.id,
    status: 'active',
  });

  const fresh = await Subscription.findByPk(subscription.id, { include: [{ model: Plan, as: 'plan' }] });
  return res.status(201).json(fresh);
}

// ── Catálogo de planes (global, no por restaurante) ─────────────────

async function listAllPlans(req, res) {
  const plans = await Plan.findAll({ order: [['priceMonthly', 'ASC']] });
  return res.json(plans);
}

async function createPlan(req, res) {
  const { code, name, priceMonthly, maxTables, maxUsers, maxProducts, maxPhotos, maxVideos, maxCategories } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code y name son obligatorios.' });

  const existing = await Plan.findOne({ where: { code } });
  if (existing) return res.status(409).json({ error: 'Ya existe un plan con ese código.' });

  const plan = await Plan.create({
    code,
    name,
    priceMonthly: priceMonthly ?? 0,
    maxTables,
    maxUsers,
    maxProducts,
    maxPhotos,
    maxVideos,
    maxCategories,
  });
  return res.status(201).json(plan);
}

async function updatePlan(req, res) {
  const plan = await Plan.findByPk(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado.' });

  const fields = ['name', 'priceMonthly', 'maxTables', 'maxUsers', 'maxProducts', 'maxPhotos', 'maxVideos', 'maxCategories', 'isActive'];
  const updates = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  await plan.update(updates);
  return res.json(plan);
}

module.exports = {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  setRestaurantStatus,
  changeRestaurantPlan,
  listAllPlans,
  createPlan,
  updatePlan,
};