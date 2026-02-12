const { generateOrder } = require('../services/orderGeneratorService');
const { decrement, isGameOver } = require('../services/satisfactionService');
const pool = require('../config/db');

// Active loops per restaurant
const activeLoops = new Map();

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startOrderLoop(socket, restaurantId) {
  if (activeLoops.has(restaurantId)) return;

  const state = { activeOrders: new Map(), timeout: null };

  function scheduleNext() {
    const delay = randomBetween(8000, 15000);
    state.timeout = setTimeout(async () => {
      const order = await generateOrder(restaurantId);
      if (!order) { scheduleNext(); return; }

      // Set expiry timer for this order
      const expiryTimeout = setTimeout(async () => {
        state.activeOrders.delete(order.id);
        socket.emit('order:expired', { orderId: order.id });

        // Log expired order
        await pool.query(
          'INSERT INTO orders (restaurant_id, recipe_id, status, resolved_at) VALUES (?, ?, ?, NOW())',
          [restaurantId, order.recipeId, 'expired']
        );

        // Penalize satisfaction
        const newSatisfaction = await decrement(restaurantId);
        socket.emit('satisfaction:update', { satisfaction: newSatisfaction });

        if (isGameOver(newSatisfaction)) {
          socket.emit('game:over', { satisfaction: newSatisfaction });
          stopOrderLoop(restaurantId);
        }
      }, order.timeLimit * 1000);

      state.activeOrders.set(order.id, { order, timeout: expiryTimeout });
      socket.emit('order:new', order);

      scheduleNext();
    }, delay);
  }

  scheduleNext();
  activeLoops.set(restaurantId, state);
}

function stopOrderLoop(restaurantId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return;

  clearTimeout(state.timeout);
  for (const [, { timeout }] of state.activeOrders) {
    clearTimeout(timeout);
  }
  activeLoops.delete(restaurantId);
}

function getActiveOrder(restaurantId, orderId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return null;
  const entry = state.activeOrders.get(orderId);
  return entry ? entry.order : null;
}

function removeActiveOrder(restaurantId, orderId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return;
  const entry = state.activeOrders.get(orderId);
  if (entry) {
    clearTimeout(entry.timeout);
    state.activeOrders.delete(orderId);
  }
}

module.exports = { startOrderLoop, stopOrderLoop, getActiveOrder, removeActiveOrder };
