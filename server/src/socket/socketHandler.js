const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { startOrderLoop, stopGenerating, stopOrderLoop, getActiveOrder, removeActiveOrder, isGenerating, getAllActiveOrders } = require('./orderLoop');
const { increment, getSatisfaction, resetSatisfaction } = require('../services/satisfactionService');
const { serveOrder, checkStock, getTreasury } = require('../services/economyService');
const pool = require('../config/db');

async function getStock(restaurantId) {
  const [rows] = await pool.query(
    `SELECT i.id, i.name, i.emoji, COALESCE(s.quantity, 0) as quantity
     FROM ingredients i
     LEFT JOIN stock s ON s.ingredient_id = i.id AND s.restaurant_id = ?
     HAVING quantity > 0`,
    [restaurantId]
  );
  return rows;
}

function setupSocket(io) {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token missing'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.restaurantId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const restaurantId = socket.restaurantId;
    console.log(`Restaurant ${restaurantId} connected`);

    // Client requests current service state (e.g. after navigating back)
    socket.on('service:status', async () => {
      const generating = isGenerating(restaurantId);
      const satisfaction = await getSatisfaction(restaurantId);
      const treasury = await getTreasury(restaurantId);
      const stock = await getStock(restaurantId);
      const orders = getAllActiveOrders(restaurantId);
      socket.emit('service:status', { generating, satisfaction, treasury, stock, orders });
    });

    // Start the service (order loop)
    socket.on('service:start', async () => {
      const satisfaction = await getSatisfaction(restaurantId);
      const treasury = await getTreasury(restaurantId);
      const stock = await getStock(restaurantId);
      socket.emit('satisfaction:update', { satisfaction });
      socket.emit('treasury:update', { treasury });
      socket.emit('stock:update', { stock });
      startOrderLoop(socket, restaurantId);
    });

    // Stop generating new orders (active orders remain)
    socket.on('service:stop', () => {
      stopGenerating(restaurantId);
    });

    // Player tries to serve an order
    socket.on('order:served', async ({ orderId }) => {
      const order = getActiveOrder(restaurantId, orderId);

      if (!order) {
        socket.emit('order:result', { success: false, message: 'Order not found or expired' });
        return;
      }

      // Check recipe is discovered
      const [rows] = await pool.query(
        'SELECT 1 FROM discovered_recipes WHERE restaurant_id = ? AND recipe_id = ?',
        [restaurantId, order.recipeId]
      );
      if (rows.length === 0) {
        socket.emit('order:result', { success: false, message: 'Recipe not known' });
        return;
      }

      // Check stock
      const stockCheck = await checkStock(restaurantId, order.recipeId);
      if (!stockCheck.hasStock) {
        const missingNames = stockCheck.missing.map(m => m.name).join(', ');
        socket.emit('order:result', { success: false, message: `Missing ingredients: ${missingNames}` });
        return;
      }

      // Serve: decrement stock + increment treasury + log transaction
      const { treasury } = await serveOrder(restaurantId, order.recipeId, order.recipeName, order.sellPrice);

      removeActiveOrder(restaurantId, orderId);
      const newSatisfaction = await increment(restaurantId);

      await pool.query(
        'INSERT INTO orders (restaurant_id, recipe_id, status, resolved_at) VALUES (?, ?, ?, NOW())',
        [restaurantId, order.recipeId, 'served']
      );

      // Send updated stock after serving
      const stock = await getStock(restaurantId);

      socket.emit('order:result', {
        success: true,
        satisfaction: newSatisfaction,
        treasury,
        message: `Served ${order.recipeName}! +${order.sellPrice}$`,
      });
      socket.emit('stock:update', { stock });
    });

    // Reset game
    socket.on('game:reset', async () => {
      stopOrderLoop(restaurantId);
      await resetSatisfaction(restaurantId);
      const treasury = await getTreasury(restaurantId);
      const stock = await getStock(restaurantId);
      socket.emit('satisfaction:update', { satisfaction: 20 });
      socket.emit('treasury:update', { treasury });
      socket.emit('stock:update', { stock });
    });

    socket.on('disconnect', () => {
      stopOrderLoop(restaurantId);
      console.log(`Restaurant ${restaurantId} disconnected`);
    });
  });
}

module.exports = { setupSocket };
