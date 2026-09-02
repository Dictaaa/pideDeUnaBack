const { Role, Permission } = require('../models');

/** GET /api/roles — catálogo global (SUPER_ADMIN, RESTAURANT_ADMIN, MANAGER, WAITER, KITCHEN, CASHIER) */
async function list(req, res) {
  const roles = await Role.findAll({
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  return res.json(roles);
}

/** POST /api/roles — poco frecuente (los 6 roles del sistema ya vienen del seed) */
async function create(req, res) {
  const { code, name, description } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code y name son obligatorios.' });

  try {
    const role = await Role.create({ code, name, description, isSystem: false });
    return res.status(201).json(role);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un rol con ese code.' });
    }
    throw err;
  }
}

/** PUT /api/roles/:id/permissions — body: { permissionIds: [uuid, ...] } */
async function setPermissions(req, res) {
  const role = await Role.findByPk(req.params.id);
  if (!role) return res.status(404).json({ error: 'Rol no encontrado.' });

  await role.setPermissions(req.body.permissionIds || []);
  const fresh = await Role.findByPk(role.id, {
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  return res.json(fresh.permissions);
}

module.exports = { list, create, setPermissions };
