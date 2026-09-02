const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/subscription.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.getCurrent));
router.post('/', asyncHandler(ctrl.changePlan));

module.exports = router;
