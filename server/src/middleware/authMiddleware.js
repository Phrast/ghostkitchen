const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token missing' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.restaurantId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
