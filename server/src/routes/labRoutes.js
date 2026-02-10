const { Router } = require('express');
const { combine, getIngredients } = require('../controllers/labController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware);
router.post('/combine', combine);
router.get('/ingredients', getIngredients);

module.exports = router;
