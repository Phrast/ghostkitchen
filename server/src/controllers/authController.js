const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO restaurants (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );

    const restaurant = { id: result.insertId, name, email, treasury: 500 };
    const token = generateToken(restaurant);

    res.status(201).json({ token, restaurant });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password, treasury FROM restaurants WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const restaurant = rows[0];
    const valid = await comparePassword(password, restaurant.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(restaurant);
    res.json({ token, restaurant: { id: restaurant.id, name: restaurant.name, email: restaurant.email, treasury: restaurant.treasury } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, treasury FROM restaurants WHERE id = ?',
      [req.restaurantId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ restaurant: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
