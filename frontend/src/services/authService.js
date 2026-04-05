import api from './axiosConfig';

export const authService = {
  register:       (data)  => api.post('/auth/register', data),
  login:          (data)  => api.post('/auth/login', data),
  logout:         ()      => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, data) => api.post(`/auth/reset-password/${token}`, data),
  refreshToken:   (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

export const userService = {
  getMe:          ()     => api.get('/users/me'),
  updateMe:       (data) => api.patch('/users/me', data),
  getAddresses:   ()     => api.get('/users/me/addresses'),
  addAddress:     (data) => api.post('/users/me/addresses', data),
  updateAddress:  (id, data) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress:  (id)   => api.delete(`/users/me/addresses/${id}`),
};
