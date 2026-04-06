import api from './axiosConfig';

export const shopService = {
  getCategories: () => api.get('/categories'),
  getFeaturedProducts: (limit = 4) => api.get('/products/featured', { params: { limit } }),
  getProducts: (params) => api.get('/products', { params }),
};
