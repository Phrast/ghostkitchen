const pool = require('../config/db');

async function generateOrder(restaurantId) {
  // Pick a random recipe the player has discovered
  const [rows] = await pool.query(`
    SELECT r.id, r.name, r.sell_price
    FROM discovered_recipes dr
    JOIN recipes r ON r.id = dr.recipe_id
    WHERE dr.restaurant_id = ?
    ORDER BY RAND()
    LIMIT 1
  `, [restaurantId]);

  if (rows.length === 0) return null;

  const recipe = rows[0];

  // Fetch ingredients for this recipe
  const [ingredients] = await pool.query(
    `SELECT i.id, i.name, i.emoji
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = ?`,
    [recipe.id]
  );

  return {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    recipeId: recipe.id,
    recipeName: recipe.name,
    sellPrice: recipe.sell_price,
    ingredients,
    timeLimit: 30,
    createdAt: Date.now(),
  };
}

module.exports = { generateOrder };
