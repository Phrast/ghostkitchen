const pool = require('../config/db');

async function getStats(req, res, next) {
  try {
    const restaurantId = req.restaurantId;

    // Treasury evolution grouped by day
    const [transactions] = await pool.query(
      `SELECT DATE(created_at) as date, type,
              SUM(amount) as total
       FROM transactions
       WHERE restaurant_id = ?
       GROUP BY DATE(created_at), type
       ORDER BY date`,
      [restaurantId]
    );

    // Current treasury
    const [restRows] = await pool.query(
      'SELECT treasury FROM restaurants WHERE id = ?',
      [restaurantId]
    );

    // Total sales and purchases
    const [totals] = await pool.query(
      `SELECT type, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE restaurant_id = ?
       GROUP BY type`,
      [restaurantId]
    );

    res.json({
      treasury: restRows[0]?.treasury ?? 0,
      transactions,
      totals,
    });
  } catch (err) {
    next(err);
  }
}

async function getMargins(req, res, next) {
  try {
    const restaurantId = req.restaurantId;

    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.sell_price,
              (SELECT SUM(i.buy_price)
               FROM recipe_ingredients ri
               JOIN ingredients i ON i.id = ri.ingredient_id
               WHERE ri.recipe_id = r.id) as ingredient_cost,
              (SELECT COUNT(*)
               FROM orders o
               WHERE o.recipe_id = r.id AND o.restaurant_id = ? AND o.status = 'served') as times_sold
       FROM recipes r
       JOIN discovered_recipes dr ON dr.recipe_id = r.id AND dr.restaurant_id = ?`,
      [restaurantId, restaurantId]
    );

    const margins = rows.map(row => ({
      id: row.id,
      name: row.name,
      sellPrice: row.sell_price,
      ingredientCost: row.ingredient_cost,
      margin: row.sell_price - row.ingredient_cost,
      timesSold: row.times_sold,
      totalProfit: (row.sell_price - row.ingredient_cost) * row.times_sold,
    }));

    res.json({ margins });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getMargins };
