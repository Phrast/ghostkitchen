import api from './axios';

export const getDiscoveredRecipesApi = () =>
  api.get('/recipes');
