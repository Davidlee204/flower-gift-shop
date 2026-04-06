import api from './axiosConfig';

// ── Admin Service — tất cả API gọi cho quản lý admin (CRUD các resources)

export const adminService = {
  // ✅ PRODUCT MANAGEMENT
  getAdminProducts: (params) => api.get('/products', { params }),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/products/${productId}`),

  // ✅ ORDER MANAGEMENT
  getAdminOrders: (params) => api.get('/orders', { params }),
  getOrderDetail: (orderId) => api.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}`, { status }),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),

  // ✅ USER MANAGEMENT
  getAdminUsers: (params) => api.get('/users', { params }),
  getUserDetail: (userId) => api.get(`/users/${userId}`),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  lockUser: (userId) => api.put(`/users/${userId}/lock`, {}),
  unlockUser: (userId) => api.put(`/users/${userId}/unlock`, {}),

  // ✅ COUPON MANAGEMENT
  getAdminCoupons: (params) => api.get('/coupons', { params }),
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (couponId, couponData) => api.put(`/coupons/${couponId}`, couponData),
  deleteCoupon: (couponId) => api.delete(`/coupons/${couponId}`),

  // ✅ CATEGORY MANAGEMENT
  getAdminCategories: (params) => api.get('/categories', { params }),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (catId, categoryData) => api.put(`/categories/${catId}`, categoryData),
  deleteCategory: (catId) => api.delete(`/categories/${catId}`),

  // ✅ DASHBOARD STATS
  getDashboardStats: () => api.get('/admin/stats'),
  getRevenueStats: (period = 'month') => api.get('/admin/revenue', { params: { period } }),
};
