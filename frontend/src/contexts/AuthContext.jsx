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

// ✅ Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000 < Date.now();
  } catch (err) {
    return true; // Token không hợp lệ coi như hết hạn
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Kiểm tra token khi app load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // ✅ VALIDATE token - nếu hết hạn thì xóa
      if (isTokenExpired(token)) {
        console.warn('⚠️ Token hết hạn, xóa khỏi storage');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } else {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    }
  }, []);

  // FGS-11: API đăng ký
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data;

      // ✅ Xóa cart & wishlist cũ trước khi register
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      
      // Lưu token và user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
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
      const { user, accessToken, refreshToken } = response.data;

      // ✅ Xóa cart & wishlist của user cũ trước khi login
      localStorage.removeItem('cart');
      localStorage.removeItem('wishlist');
      
      // Lưu token và user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
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
    // ✅ Xóa auth tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // ✅ Xóa cart & wishlist của user
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
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