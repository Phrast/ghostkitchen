const { Router } = require('express');
const { getDiscoveredRecipes } = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware);
router.get('/', getDiscoveredRecipes);

module.exports = router;
