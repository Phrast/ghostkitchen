const pool = require('../config/db');
const { findMatch } = require('../services/recipeMatchingService');

async function combine(req, res, next) {
  try {
    const { ingredientIds } = req.body;
    if (!ingredientIds || !Array.isArray(ingredientIds) || ingredientIds.length === 0) {
      return res.status(400).json({ error: 'ingredientIds array is required' });
    }

    const recipe = await findMatch(ingredientIds);

    if (!recipe) {
      return res.json({ found: false, message: 'No recipe found with these ingredients' });
    }

    // Save discovered recipe (ignore if already discovered)
    await pool.query(
      'INSERT IGNORE INTO discovered_recipes (restaurant_id, recipe_id) VALUES (?, ?)',
      [req.restaurantId, recipe.id]
    );

    res.json({ found: true, recipe: { id: recipe.id, name: recipe.name, description: recipe.description } });
  } catch (err) {
    next(err);
  }
}

async function getIngredients(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, emoji FROM ingredients ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { combine, getIngredients };
