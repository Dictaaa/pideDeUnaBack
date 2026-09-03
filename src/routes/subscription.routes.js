const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/subscription.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.getCurrent));
router.get('/usage', asyncHandler(ctrl.getUsage));
router.post('/', asyncHandler(ctrl.changePlan));

module.exports = router;