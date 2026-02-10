import api from './axios';

export const getIngredientsApi = () =>
  api.get('/lab/ingredients');

export const combineApi = (ingredientIds) =>
  api.post('/lab/combine', { ingredientIds });
