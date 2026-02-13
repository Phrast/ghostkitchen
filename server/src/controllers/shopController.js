const pool = require('../config/db');
const { buyIngredient, getTreasury } = require('../services/economyService');

async function getShopIngredients(req, res, next) {
  try {
    const restaurantId = req.restaurantId;
    const [rows] = await pool.query(
      `SELECT i.id, i.name, i.emoji, i.buy_price,
              COALESCE(s.quantity, 0) as stock
       FROM ingredients i
       LEFT JOIN stock s ON s.ingredient_id = i.id AND s.restaurant_id = ?
       ORDER BY i.name`,
      [restaurantId]
    );
    const treasury = await getTreasury(restaurantId);
    res.json({ ingredients: rows, treasury });
  } catch (err) {
    next(err);
  }
}

async function buy(req, res, next) {
  try {
    const { ingredientId, quantity } = req.body;
    if (!ingredientId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid ingredientId or quantity' });
    }
    const result = await buyIngredient(req.restaurantId, ingredientId, quantity);
    res.json(result);
  } catch (err) {
    if (err.message === 'Not enough money' || err.message === 'Ingredient not found') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = { getShopIngredients, buy };
