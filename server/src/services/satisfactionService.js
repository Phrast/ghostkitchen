const pool = require('../config/db');

async function getSatisfaction(restaurantId) {
  const [rows] = await pool.query(
    'SELECT satisfaction FROM restaurants WHERE id = ?',
    [restaurantId]
  );
  return rows[0]?.satisfaction ?? 0;
}

async function increment(restaurantId) {
  const [result] = await pool.query(
    'UPDATE restaurants SET satisfaction = satisfaction + 1 WHERE id = ?',
    [restaurantId]
  );
  return getSatisfaction(restaurantId);
}

async function decrement(restaurantId, penalty = 10) {
  await pool.query(
    'UPDATE restaurants SET satisfaction = satisfaction - ? WHERE id = ?',
    [penalty, restaurantId]
  );
  return getSatisfaction(restaurantId);
}

function isGameOver(satisfaction) {
  return satisfaction < 0;
}

async function resetSatisfaction(restaurantId) {
  await pool.query(
    'UPDATE restaurants SET satisfaction = 20 WHERE id = ?',
    [restaurantId]
  );
}

module.exports = { getSatisfaction, increment, decrement, isGameOver, resetSatisfaction };
