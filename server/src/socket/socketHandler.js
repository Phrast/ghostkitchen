const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { startOrderLoop, stopOrderLoop, getActiveOrder, removeActiveOrder } = require('./orderLoop');
const { increment, getSatisfaction, resetSatisfaction } = require('../services/satisfactionService');
const pool = require('../config/db');

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

    // Start the service (order loop)
    socket.on('service:start', async () => {
      const satisfaction = await getSatisfaction(restaurantId);
      socket.emit('satisfaction:update', { satisfaction });
      startOrderLoop(socket, restaurantId);
    });

    // Stop the service
    socket.on('service:stop', () => {
      stopOrderLoop(restaurantId);
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

      // Success
      removeActiveOrder(restaurantId, orderId);
      const newSatisfaction = await increment(restaurantId);

      await pool.query(
        'INSERT INTO orders (restaurant_id, recipe_id, status, resolved_at) VALUES (?, ?, ?, NOW())',
        [restaurantId, order.recipeId, 'served']
      );

      socket.emit('order:result', {
        success: true,
        satisfaction: newSatisfaction,
        message: `Served ${order.recipeName}!`,
      });
    });

    // Reset game
    socket.on('game:reset', async () => {
      stopOrderLoop(restaurantId);
      await resetSatisfaction(restaurantId);
      socket.emit('satisfaction:update', { satisfaction: 20 });
    });

    socket.on('disconnect', () => {
      stopOrderLoop(restaurantId);
      console.log(`Restaurant ${restaurantId} disconnected`);
    });
  });
}

module.exports = { setupSocket };
