const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getShopIngredients, buy } = require('../controllers/shopController');

router.get('/ingredients', auth, getShopIngredients);
router.post('/buy', auth, buy);

module.exports = router;
