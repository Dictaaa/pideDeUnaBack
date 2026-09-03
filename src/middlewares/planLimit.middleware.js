const { Subscription, Plan, MenuCategory, Product, Table, User, ProductMedia } = require('../models');

const COUNTERS = {
  categories: (restaurantId) => MenuCategory.count({ where: { restaurantId } }),
  products: (restaurantId) => Product.count({ where: { restaurantId } }),
  tables: (restaurantId) => Table.count({ where: { restaurantId } }),
  users: (restaurantId) => User.count({ where: { restaurantId } }),
  photos: (restaurantId) => ProductMedia.count({ where: { restaurantId, mediaType: 'IMAGE' } }),
  videos: (restaurantId) => ProductMedia.count({ where: { restaurantId, mediaType: 'VIDEO' } }),
};

const PLAN_FIELD = {
  categories: 'maxCategories',
  products: 'maxProducts',
  tables: 'maxTables',
  users: 'maxUsers',
  photos: 'maxPhotos',
  videos: 'maxVideos',
};

const RESOURCE_LABEL = {
  categories: 'categorías',
  products: 'productos',
  tables: 'mesas',
  users: 'usuarios',
  photos: 'fotos',
  videos: 'videos',
};

/**
 * Trae la suscripción activa (o en trial) del restaurante, con su plan.
 * La reutilizan este middleware y subscription.controller.js — un solo
 * lugar decide qué cuenta como "suscripción vigente".
 */
async function getActiveSubscription(restaurantId) {
  return Subscription.findOne({
    where: { restaurantId, status: ['trial', 'active', 'past_due'] },
    include: [{ model: Plan, as: 'plan' }],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Middleware factory: exige que el restaurante tenga cupo en su plan
 * ANTES de crear el recurso. Uso:
 *   router.post('/', authenticate, ..., enforcePlanLimit('products'), asyncHandler(ctrl.create))
 */
function enforcePlanLimit(resource) {
  return async (req, res, next) => {
    try {
      const subscription = await getActiveSubscription(req.restaurant.id);

      if (!subscription || !subscription.plan) {
        return res.status(403).json({
          error: 'Este restaurante no tiene una suscripción activa. Ve a Configuración > Plan para activar una.',
        });
      }

      const limit = subscription.plan[PLAN_FIELD[resource]];
      if (limit === null || limit === undefined) return next(); // sin límite (plan Premium)

      const current = await COUNTERS[resource](req.restaurant.id);
      if (current >= limit) {
        return res.status(403).json({
          error: `Alcanzaste el límite de ${RESOURCE_LABEL[resource]} de tu plan ${subscription.plan.name} (${limit}). Mejora tu plan para agregar más.`,
          limit,
          current,
          plan: subscription.plan.code,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Caso especial: subir foto/video de producto. El tipo (foto o video)
 * solo se sabe DESPUÉS de que multer procesa el archivo, así que este
 * middleware decide sobre la marcha cuál límite aplicar.
 */
function enforceMediaLimit(req, res, next) {
  if (!req.file) return next(); // el controller ya valida esto y devuelve 400
  const resource = req.file.mimetype.startsWith('video/') ? 'videos' : 'photos';
  return enforcePlanLimit(resource)(req, res, next);
}

module.exports = { enforcePlanLimit, enforceMediaLimit, getActiveSubscription };