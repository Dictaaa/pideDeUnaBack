const {
  Product,
  ProductMedia,
  Ingredient,
  Allergen,
  ModifierGroup,
  Modifier,
} = require('../models');

const DETAIL_INCLUDE = [
  { model: ProductMedia, as: 'media' },
  { model: Ingredient, as: 'ingredients', through: { attributes: [] } },
  { model: Allergen, as: 'allergens', through: { attributes: [] } },
  {
    model: ModifierGroup,
    as: 'modifierGroups',
    through: { attributes: [] },
    include: [{ model: Modifier, as: 'modifiers' }],
  },
];

/** GET /api/restaurantes/:slug/products — vista admin (incluye no disponibles) */
async function list(req, res) {
  const where = { restaurantId: req.restaurant.id };
  if (req.query.categoryId) where.categoryId = req.query.categoryId;

  const products = await Product.findAll({
    where,
    order: [['sortOrder', 'ASC']],
    include: DETAIL_INCLUDE,
  });
  return res.json(products);
}

/** GET /api/restaurantes/:slug/products/:id */
async function getOne(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
    include: DETAIL_INCLUDE,
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });
  return res.json(product);
}

/** POST /api/restaurantes/:slug/products */
async function create(req, res) {
  const { name, slug, categoryId, price } = req.body;
  if (!name || !slug || price === undefined) {
    return res.status(400).json({ error: 'name, slug y price son obligatorios.' });
  }

  const CREATABLE = [
    'name',
    'slug',
    'categoryId',
    'description',
    'shortDescription',
    'price',
    'costPrice',
    'sku',
    'imageUrl',
    'isAvailable',
    'isFeatured',
    'isRecommended',
    'sortOrder',
    'preparationTimeMinutes',
  ];
  const data = { restaurantId: req.restaurant.id };
  for (const field of CREATABLE) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  try {
    const product = await Product.create(data);
    return res.status(201).json(product);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug en este restaurante.' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
    }
    throw err;
  }
}

/** PATCH /api/restaurantes/:slug/products/:id */
async function update(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  const EDITABLE = [
    'name',
    'slug',
    'categoryId',
    'description',
    'shortDescription',
    'price',
    'costPrice',
    'sku',
    'imageUrl',
    'isAvailable',
    'isFeatured',
    'isRecommended',
    'sortOrder',
    'preparationTimeMinutes',
  ];
  const updates = {};
  for (const field of EDITABLE) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  try {
    await product.update(updates);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe un producto con ese slug en este restaurante.' });
    }
    throw err;
  }

  return res.json(product);
}

/** DELETE /api/restaurantes/:slug/products/:id — soft delete */
async function remove(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  await product.destroy();
  return res.status(204).send();
}

/**
 * PUT /api/restaurantes/:slug/products/:id/ingredients
 * body: { ingredientIds: [uuid, uuid, ...] }
 * Reemplaza la lista completa (no agrega uno por uno).
 */
async function setIngredients(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  await product.setIngredients(req.body.ingredientIds || []);
  const fresh = await Product.findByPk(product.id, {
    include: [{ model: Ingredient, as: 'ingredients', through: { attributes: [] } }],
  });
  return res.json(fresh.ingredients);
}

/** PUT /api/restaurantes/:slug/products/:id/allergens — mismo patrón que ingredients */
async function setAllergens(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  await product.setAllergens(req.body.allergenIds || []);
  const fresh = await Product.findByPk(product.id, {
    include: [{ model: Allergen, as: 'allergens', through: { attributes: [] } }],
  });
  return res.json(fresh.allergens);
}

/** PUT /api/restaurantes/:slug/products/:id/modifier-groups — mismo patrón */
async function setModifierGroups(req, res) {
  const product = await Product.findOne({
    where: { id: req.params.id, restaurantId: req.restaurant.id },
  });
  if (!product) return res.status(404).json({ error: 'Producto no encontrado.' });

  await product.setModifierGroups(req.body.modifierGroupIds || []);
  const fresh = await Product.findByPk(product.id, {
    include: [
      {
        model: ModifierGroup,
        as: 'modifierGroups',
        through: { attributes: [] },
        include: [{ model: Modifier, as: 'modifiers' }],
      },
    ],
  });
  return res.json(fresh.modifierGroups);
}

module.exports = { list, getOne, create, update, remove, setIngredients, setAllergens, setModifierGroups };
