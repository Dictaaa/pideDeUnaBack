const {
  Restaurant,
  MenuCategory,
  Product,
  ProductMedia,
  Ingredient,
  Allergen,
  ModifierGroup,
  Modifier,
} = require('../models');

/**
 * GET /api/restaurantes/:slug/menu
 * Devuelve el restaurante con sus categorías, productos y todo lo
 * necesario para pintar el menú público (fotos, ingredientes,
 * alérgenos y modificadores). Pensado como el primer endpoint real
 * del proyecto: "solo ver el menú de una tienda".
 */
async function getMenuBySlug(req, res) {
  try {
    const { slug } = req.params;

    const restaurant = await Restaurant.findOne({
      where: { slug, status: ['active', 'trial'] },
      attributes: ['id', 'name', 'slug', 'description', 'logoUrl', 'coverUrl', 'city', 'currency'],
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado.' });
    }

    const categories = await MenuCategory.findAll({
      where: { restaurantId: restaurant.id, isActive: true },
      order: [['sortOrder', 'ASC']],
      include: [
        {
          model: Product,
          as: 'products',
          where: { isAvailable: true },
          required: false,
          order: [['sortOrder', 'ASC']],
          include: [
            { model: ProductMedia, as: 'media' },
            { model: Ingredient, as: 'ingredients', through: { attributes: [] } },
            { model: Allergen, as: 'allergens', through: { attributes: [] } },
            {
              model: ModifierGroup,
              as: 'modifierGroups',
              through: { attributes: [] },
              include: [{ model: Modifier, as: 'modifiers' }],
            },
          ],
        },
      ],
    });

    return res.json({ restaurant, categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error consultando el menú.' });
  }
}

module.exports = { getMenuBySlug };
