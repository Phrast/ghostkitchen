const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function generateToken(restaurant) {
  return jwt.sign(
    { id: restaurant.id, email: restaurant.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = generateToken;
