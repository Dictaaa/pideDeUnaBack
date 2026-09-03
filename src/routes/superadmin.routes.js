const router = require('express').Router();
const ctrl = require('../controllers/Superadmin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

// Todo lo de acá exige estar autenticado como SUPER_ADMIN — a
// diferencia de las rutas /restaurantes/:slug/..., estas NO están
// atadas a un restaurante en particular (por eso no llevan
// resolveRestaurant ni requireSameRestaurant).
router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/restaurants', asyncHandler(ctrl.listRestaurants));
router.post('/restaurants', asyncHandler(ctrl.createRestaurant));
router.get('/restaurants/:id', asyncHandler(ctrl.getRestaurant));
router.patch('/restaurants/:id', asyncHandler(ctrl.updateRestaurant));
router.post('/restaurants/:id/status', asyncHandler(ctrl.setRestaurantStatus));
router.post('/restaurants/:id/plan', asyncHandler(ctrl.changeRestaurantPlan));

router.get('/plans', asyncHandler(ctrl.listAllPlans));
router.post('/plans', asyncHandler(ctrl.createPlan));
router.patch('/plans/:id', asyncHandler(ctrl.updatePlan));

module.exports = router;