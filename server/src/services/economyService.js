const pool = require('../config/db');

async function getTreasury(restaurantId) {
  const [rows] = await pool.query(
    'SELECT treasury FROM restaurants WHERE id = ?',
    [restaurantId]
  );
  return rows[0]?.treasury ?? 0;
}

async function buyIngredient(restaurantId, ingredientId, quantity) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // Get ingredient info
    const [ingRows] = await connection.query(
      'SELECT name, buy_price FROM ingredients WHERE id = ?',
      [ingredientId]
    );
    if (ingRows.length === 0) throw new Error('Ingredient not found');

    const { name, buy_price } = ingRows[0];
    const totalCost = buy_price * quantity;

    // Check treasury
    const [restRows] = await connection.query(
      'SELECT treasury FROM restaurants WHERE id = ? FOR UPDATE',
      [restaurantId]
    );
    if (restRows[0].treasury < totalCost) {
      throw new Error('Not enough money');
    }

    // Decrement treasury
    await connection.query(
      'UPDATE restaurants SET treasury = treasury - ? WHERE id = ?',
      [totalCost, restaurantId]
    );

    // Upsert stock
    await connection.query(
      `INSERT INTO stock (restaurant_id, ingredient_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [restaurantId, ingredientId, quantity, quantity]
    );

    // Log transaction
    await connection.query(
      'INSERT INTO transactions (restaurant_id, type, amount, description) VALUES (?, ?, ?, ?)',
      [restaurantId, 'purchase', totalCost, `Bought ${quantity}x ${name}`]
    );

    await connection.commit();

    const newTreasury = restRows[0].treasury - totalCost;
    return { treasury: newTreasury, cost: totalCost };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function serveOrder(restaurantId, recipeId, recipeName, sellPrice) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    // Get recipe ingredients
    const [ingredients] = await connection.query(
      'SELECT ingredient_id FROM recipe_ingredients WHERE recipe_id = ?',
      [recipeId]
    );

    // Check and decrement stock for each ingredient
    for (const { ingredient_id } of ingredients) {
      const [stockRows] = await connection.query(
        'SELECT quantity FROM stock WHERE restaurant_id = ? AND ingredient_id = ? FOR UPDATE',
        [restaurantId, ingredient_id]
      );
      if (stockRows.length === 0 || stockRows[0].quantity < 1) {
        throw new Error('Insufficient stock');
      }
      await connection.query(
        'UPDATE stock SET quantity = quantity - 1 WHERE restaurant_id = ? AND ingredient_id = ?',
        [restaurantId, ingredient_id]
      );
    }

    // Increment treasury
    await connection.query(
      'UPDATE restaurants SET treasury = treasury + ? WHERE id = ?',
      [sellPrice, restaurantId]
    );

    // Log sale transaction
    await connection.query(
      'INSERT INTO transactions (restaurant_id, type, amount, description, recipe_id) VALUES (?, ?, ?, ?, ?)',
      [restaurantId, 'sale', sellPrice, `Sold ${recipeName}`, recipeId]
    );

    await connection.commit();

    const [restRows] = await pool.query(
      'SELECT treasury FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    return { treasury: restRows[0].treasury };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function checkStock(restaurantId, recipeId) {
  const [ingredients] = await pool.query(
    'SELECT ri.ingredient_id, i.name, COALESCE(s.quantity, 0) as quantity FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id LEFT JOIN stock s ON s.restaurant_id = ? AND s.ingredient_id = ri.ingredient_id WHERE ri.recipe_id = ?',
    [restaurantId, recipeId]
  );
  const missing = ingredients.filter(i => i.quantity < 1);
  return { hasStock: missing.length === 0, ingredients, missing };
}

module.exports = { getTreasury, buyIngredient, serveOrder, checkStock };
