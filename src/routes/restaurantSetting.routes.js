const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/restaurantSetting.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.get));
router.patch('/', asyncHandler(ctrl.update));

module.exports = router;
