// src/routes/index.js
const { Router } = require('express');
const router = Router();

const restaurantRoutes   = require('./restaurant.routes'); // /:slug/* -> perfil, menú, categorías, productos, ingredientes, modificadores, usuarios, mesas, áreas, clientes, reservas, promociones, reviews, settings, auditoría, auth/login
const allergenRoutes     = require('./allergen.routes');   // catálogo global de alérgenos
const roleRoutes         = require('./role.routes');       // catálogo global de roles
const permissionRoutes   = require('./permission.routes'); // catálogo global de permisos
const planRoutes         = require('./plan.routes');       // catálogo global de planes
const authAdminRoutes    = require('./authAdmin.routes');  // login del SUPER_ADMIN (global, sin slug)

// ── Módulos con prefijo ───────────────────────────────────
router.use('/restaurantes', restaurantRoutes);
router.use('/alergenos', allergenRoutes);
router.use('/roles', roleRoutes);
router.use('/permisos', permissionRoutes);
router.use('/planes', planRoutes);
router.use('/auth', authAdminRoutes);

// ── Salud ──────────────────────────────────────────────────
router.get('/health', (_req, res) => res.json({ ok: true }));

// ── 404 ──────────────────────────────────────────────────
router.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = router;