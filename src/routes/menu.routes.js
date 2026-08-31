const { Router } = require('express');
const { getMenuBySlug } = require('../controllers/menu.controller');

const router = Router();

// GET /api/restaurantes/restaurante-sua/menu
router.get('/:slug/menu', getMenuBySlug);

module.exports = router;
