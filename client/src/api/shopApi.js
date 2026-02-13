import api from './axios';

export const getShopIngredients = () => api.get('/shop/ingredients');
export const buyIngredient = (ingredientId, quantity) =>
  api.post('/shop/buy', { ingredientId, quantity });
