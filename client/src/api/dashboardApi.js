import api from './axios';

export const getStats = () => api.get('/dashboard/stats');
export const getMargins = () => api.get('/dashboard/margins');
