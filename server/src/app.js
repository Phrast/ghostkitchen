const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const labRoutes = require('./routes/labRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/recipes', recipeRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
