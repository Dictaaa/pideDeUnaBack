const router = require('express').Router();
const ctrl = require('../controllers/allergen.controller');
const { asyncHandler } = require('../middlewares/error.middleware');

router.get('/', asyncHandler(ctrl.list));
router.post('/', asyncHandler(ctrl.create));

module.exports = router;
