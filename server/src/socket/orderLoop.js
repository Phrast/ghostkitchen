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

  const state = { activeOrders: new Map(), timeout: null, generating: true };

  function scheduleNext() {
    if (!state.generating) return;
    const delay = randomBetween(8000, 15000);
    state.timeout = setTimeout(async () => {
      if (!state.generating) return;
      const order = await generateOrder(restaurantId);
      if (!order) { scheduleNext(); return; }

      // Set expiry timer for this order
      const expiryTimeout = setTimeout(async () => {
        state.activeOrders.delete(order.id);
        socket.emit('order:expired', { orderId: order.id });

        // Clean up if no more orders and not generating
        if (!state.generating && state.activeOrders.size === 0) {
          activeLoops.delete(restaurantId);
        }

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

// Stop generating new orders, but keep active orders alive
function stopGenerating(restaurantId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return;

  state.generating = false;
  clearTimeout(state.timeout);
  state.timeout = null;

  // If no active orders, clean up entirely
  if (state.activeOrders.size === 0) {
    activeLoops.delete(restaurantId);
  }
}

// Full stop: stop generating + cancel all active orders
function stopOrderLoop(restaurantId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return;

  state.generating = false;
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

  // Clean up if no more orders and not generating
  if (!state.generating && state.activeOrders.size === 0) {
    activeLoops.delete(restaurantId);
  }
}

function isGenerating(restaurantId) {
  const state = activeLoops.get(restaurantId);
  return state ? state.generating : false;
}

function getAllActiveOrders(restaurantId) {
  const state = activeLoops.get(restaurantId);
  if (!state) return [];
  return Array.from(state.activeOrders.values()).map(entry => entry.order);
}

module.exports = { startOrderLoop, stopGenerating, stopOrderLoop, getActiveOrder, removeActiveOrder, isGenerating, getAllActiveOrders };
