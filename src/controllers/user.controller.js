const bcrypt = require('bcryptjs');
const { User, Role, UserRole } = require('../models');

const SAFE_ATTRS = ['id', 'restaurantId', 'name', 'email', 'phone', 'status', 'lastLoginAt', 'createdAt'];
// OJO: passwordHash NUNCA se incluye en una respuesta. Ver SAFE_ATTRS arriba.

/** GET /api/restaurantes/:slug/users */
async function list(req, res) {
  const users = await User.findAll({
    where: { restaurantId: req.restaurant.id },
    attributes: SAFE_ATTRS,
    include: [{ model: Role, as: 'roles', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
  });
  return res.json(users);
}

/**
 * POST /api/restaurantes/:slug/users
 * body: { name, email, phone?, password, roleIds?: [uuid, ...] }
 * Esto crea el usuario y le asigna roles; NO es login/autenticación
 * (eso es JWT + middleware de sesión, un bloque aparte).
 */
async function create(req, res) {
  const { name, email, phone, password, roleIds } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email y password son obligatorios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await User.create({
      restaurantId: req.restaurant.id,
      name,
      email,
      phone,
      passwordHash,
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email en este restaurante.' });
    }
    throw err;
  }

  if (Array.isArray(roleIds) && roleIds.length) {
    await UserRole.bulkCreate(
      roleIds.map((roleId) => ({ userId: user.id, roleId, restaurantId: req.restaurant.id }))
    );
  }

  const fresh = await User.findByPk(user.id, {
    attributes: SAFE_ATTRS,
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });
  return res.status(201).json(fresh);
}

/**
 * PATCH /api/restaurantes/:slug/users/:id
 * body: { name?, phone?, status?, password? }
 * (email no se deja cambiar aquí a propósito — cambiar el identificador
 * de login es un flujo aparte con verificación, no un campo más.)
 */
async function update(req, res) {
  const user = await User.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.phone !== undefined) updates.phone = req.body.phone;
  if (req.body.status !== undefined) updates.status = req.body.status;
  if (req.body.password) {
    if (req.body.password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    updates.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  await user.update(updates);
  const fresh = await User.findByPk(user.id, { attributes: SAFE_ATTRS });
  return res.json(fresh);
}

/** DELETE /api/restaurantes/:slug/users/:id — soft delete */
async function remove(req, res) {
  const user = await User.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  await user.destroy();
  return res.status(204).send();
}

/** PUT /api/restaurantes/:slug/users/:id/roles — body: { roleIds: [uuid, ...] } */
async function setRoles(req, res) {
  const user = await User.findOne({ where: { id: req.params.id, restaurantId: req.restaurant.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  await UserRole.destroy({ where: { userId: user.id, restaurantId: req.restaurant.id } });
  const roleIds = req.body.roleIds || [];
  if (roleIds.length) {
    await UserRole.bulkCreate(roleIds.map((roleId) => ({ userId: user.id, roleId, restaurantId: req.restaurant.id })));
  }

  const fresh = await User.findByPk(user.id, {
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });
  return res.json(fresh.roles);
}

module.exports = { list, create, update, remove, setRoles };
