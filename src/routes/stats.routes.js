const router = require('express').Router({ mergeParams: true });
const ctrl = require('../controllers/stats.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/summary', asyncHandler(ctrl.summary));
router.get('/timeseries', asyncHandler(ctrl.timeseries));
router.get('/top-products', asyncHandler(ctrl.topProducts));

module.exports = router;