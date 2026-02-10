const pool = require('../config/db');

async function getDiscoveredRecipes(req, res, next) {
  try {
    // Get discovered recipes with their ingredients
    const [recipes] = await pool.query(`
      SELECT r.id, r.name, r.description, r.sell_price
      FROM discovered_recipes dr
      JOIN recipes r ON r.id = dr.recipe_id
      WHERE dr.restaurant_id = ?
      ORDER BY dr.discovered_at DESC
    `, [req.restaurantId]);

    // For each recipe, get its ingredients
    for (const recipe of recipes) {
      const [ingredients] = await pool.query(`
        SELECT i.id, i.name, i.emoji
        FROM recipe_ingredients ri
        JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE ri.recipe_id = ?
      `, [recipe.id]);
      recipe.ingredients = ingredients;
    }

    res.json(recipes);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDiscoveredRecipes };
