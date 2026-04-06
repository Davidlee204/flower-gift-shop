import api from './axiosConfig';

// ── Shop Service — tất cả API gọi cho sản phẩm, danh mục, tìm kiếm
// Mỗi function tương ứng với một endpoint backend

export const shopService = {
  // FGS-11: Lấy danh sách danh mục
  getCategories: () => api.get('/categories'),

  // FGS-12, 14: Lấy danh sách sản phẩm với filter, sort, phân trang
  getProducts: (params) => api.get('/products', { params }),

  // FGS-09: Tìm kiếm sản phẩm (text search)
  searchProducts: (query, page = 1, limit = 12) =>
    api.get('/products/search', { params: { q: query, page, limit } }),

  // FGS-13: Lấy sản phẩm nổi bật (featured products)
  getFeaturedProducts: (limit = 4) => api.get('/products/featured', { params: { limit } }),

  // FGS-18: Lấy sản phẩm liên quan (cùng category, loại bỏ sản phẩm hiện tại)
  getRelatedProducts: (productId, limit = 6) =>
    api.get(`/products/${productId}/related`, { params: { limit } }),
};
