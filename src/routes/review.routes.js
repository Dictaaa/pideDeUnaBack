const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/review.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));

module.exports = router;
