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
 * Vista PÚBLICA del menú (la que consume el front del cliente en la
 * mesa): solo categorías activas y productos disponibles. Para la
 * vista de administrador (que necesita ver todo, incluida producto
 * pausado/categoría oculta) usa category.controller.js / product.controller.js.
 */
async function getMenuBySlug(req, res) {
  const restaurant = req.restaurant; // ya resuelto por resolveRestaurant.middleware.js

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

  const publicRestaurant = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    logoUrl: restaurant.logoUrl,
    coverUrl: restaurant.coverUrl,
    city: restaurant.city,
    currency: restaurant.currency,
    primaryColor: restaurant.primaryColor,
    secondaryColor: restaurant.secondaryColor,
    fontFamily: restaurant.fontFamily,
  };

  return res.json({ restaurant: publicRestaurant, categories });
}

module.exports = { getMenuBySlug };
