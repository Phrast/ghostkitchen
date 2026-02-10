const pool = require('../config/db');

async function findMatch(ingredientIds) {
  const sorted = [...new Set(ingredientIds)].sort((a, b) => a - b);
  const playerKey = sorted.join(',');

  const [rows] = await pool.query(`
    SELECT r.id, r.name, r.description, r.sell_price,
           GROUP_CONCAT(ri.ingredient_id ORDER BY ri.ingredient_id) as ingredient_ids
    FROM recipes r
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    GROUP BY r.id
  `);

  return rows.find(r => r.ingredient_ids === playerKey) || null;
}

module.exports = { findMatch };
