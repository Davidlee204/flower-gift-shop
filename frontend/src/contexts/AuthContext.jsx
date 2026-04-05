import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// FGS-11: Context quản lý trạng thái auth (login, register, logout)
const AuthContext = createContext();

// API base URL từ env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance với credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra token khi app load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Validate token với backend
      setIsAuthenticated(true);
    }
  }, []);

  // FGS-11: API đăng ký
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken } = response.data;

      // Lưu token và user info
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, message: 'Đăng ký thành công!' };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // FGS-12: API đăng nhập
  const login = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', userData);
      const { user, accessToken } = response.data;

      // Lưu token và user info
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, message: 'Đăng nhập thành công!' };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};