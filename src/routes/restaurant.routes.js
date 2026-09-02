const router = require('express').Router();
const resolveRestaurant = require('../middlewares/resolverestaurant.middleware');
const restaurantController = require('../controllers/restaurant.controller');
const menuController = require('../controllers/menu.controller');
const { asyncHandler } = require('../middlewares/error.middleware');
const { authenticate, authorize, requireSameRestaurant } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const ingredientRoutes = require('./ingredient.routes');
const modifierGroupRoutes = require('./modifierGroup.routes');
const userRoutes = require('./user.routes');
const subscriptionRoutes = require('./subscription.routes');
const areaRoutes = require('./restaurantArea.routes');
const tableRoutes = require('./table.routes');
const customerRoutes = require('./customer.routes');
const reservationRoutes = require('./reservation.routes');
const promotionRoutes = require('./promotion.routes');
const reviewRoutes = require('./review.routes');
const settingsRoutes = require('./restaurantSetting.routes');
const auditLogRoutes = require('./auditLog.routes');
const orderRoutes = require('./order.routes');
const statsRoutes = require('./stats.routes');

// Registro público de un restaurante nuevo — va ANTES del resolveRestaurant
// de abajo, si no, Express interpretaría "register" como si fuera un :slug.
router.post('/register', asyncHandler(restaurantController.register));

// Todo lo que cuelga de /:slug pasa primero por acá — así ningún
// controller repite el mismo "busca el restaurante o tira 404".
router.use('/:slug', asyncHandler(resolveRestaurant));

// Login: PÚBLICO a propósito (necesitas poder loguearte sin estar logueado).
// Ahora vive en /api/auth/login (global) — ver authAdmin.routes.js.

// Perfil: lectura pública (el front del cliente necesita ver nombre/logo/colores
// sin sesión), pero editarlo requiere ser admin de ESE restaurante.
router.get('/:slug', asyncHandler(restaurantController.getProfile));
router.patch(
  '/:slug',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  asyncHandler(restaurantController.updateProfile)
);

router.post(
  '/:slug/logo',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  upload.single('file'),
  asyncHandler(restaurantController.uploadLogo)
);

// Menú: público, sin autenticación (lo consume el cliente en la mesa).
router.get('/:slug/menu', asyncHandler(menuController.getMenuBySlug));

router.use('/:slug/categories', categoryRoutes);
router.use('/:slug/products', productRoutes);
router.use('/:slug/ingredients', ingredientRoutes);
router.use('/:slug/modifier-groups', modifierGroupRoutes);

// Usuarios: solo un admin del propio restaurante (o SUPER_ADMIN) administra staff.
router.use(
  '/:slug/users',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  userRoutes
);

// Suscripción: mismo criterio — decide el admin del restaurante.
router.use(
  '/:slug/subscription',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  subscriptionRoutes
);

router.use('/:slug/areas', areaRoutes);
router.use('/:slug/tables', tableRoutes);
router.use('/:slug/customers', customerRoutes);
router.use('/:slug/reservations', reservationRoutes);
router.use('/:slug/promotions', promotionRoutes);
router.use('/:slug/reviews', reviewRoutes);

// Configuración: mismo criterio que usuarios/suscripción.
router.use(
  '/:slug/settings',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  settingsRoutes
);

router.use(
  '/:slug/audit-logs',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  auditLogRoutes
);

// Pedidos: authenticate + requireSameRestaurant acá (cualquier staff del
// restaurante), pero CADA ruta adentro de order.routes.js decide el rol
// exacto (mesera vs. cocina) — por eso no hay un solo authorize() aquí.
router.use('/:slug/orders', authenticate, requireSameRestaurant, orderRoutes);

// areas
router.use(
  '/:slug/areas',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  areaRoutes
);

// Estadísticas: solo gerentes/admin — así lo pediste explícitamente.
router.use(
  '/:slug/stats',
  authenticate,
  requireSameRestaurant,
  authorize('RESTAURANT_ADMIN', 'SUPER_ADMIN'),
  statsRoutes
);

module.exports = router;
