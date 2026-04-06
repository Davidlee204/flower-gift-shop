// FGS-25: Admin Dashboard - Statistics & Overview
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    // Calculate stats from localStorage and mock data
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const orders = Object.keys(localStorage)
        .filter(k => k.startsWith('orders_'))
        .reduce((sum, k) => sum + JSON.parse(localStorage.getItem(k) || '[]').length, 0);
      const users = 5; // From seed data
      const revenue = Object.keys(localStorage)
        .filter(k => k.startsWith('orders_'))
        .reduce((sum, k) => {
          const userOrders = JSON.parse(localStorage.getItem(k) || '[]');
          return sum + userOrders.reduce((s, o) => s + (o.total || 0), 0);
        }, 0);
      const pending = Math.floor(orders * 0.3);
      
      setStats({
        totalProducts: products.length || 22,
        totalOrders: orders || 0,
        totalUsers: users,
        totalRevenue: revenue || 0,
        pendingOrders: pending || 0
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  }, [user, navigate]);

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  const menuItems = [
    { icon: '📦', label: 'Sản phẩm', path: '/admin/products', badge: stats.totalProducts },
    { icon: '📋', label: 'Đơn hàng', path: '/admin/orders', badge: stats.pendingOrders, badgeColor: 'red' },
    { icon: '👥', label: 'Người dùng', path: '/admin/users', badge: stats.totalUsers },
    { icon: '🏷️', label: 'Mã giảm giá', path: '/admin/coupons', badge: '5' },
    { icon: '📂', label: 'Danh mục', path: '/admin/categories', badge: '12' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black mb-2">⚙️ Bảng điều khiển Admin</h1>
          <p className="text-purple-200 text-lg">Chào mừng quay lại, {user?.fullName || user?.name || 'Admin'}! 👋</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { icon: '📦', title: 'Sản phẩm', value: stats.totalProducts, color: 'from-blue-500 to-cyan-500' },
            { icon: '📋', title: 'Đơn hàng', value: stats.totalOrders, color: 'from-purple-500 to-pink-500' },
            { icon: '👥', title: 'Người dùng', value: stats.totalUsers, color: 'from-green-500 to-emerald-500' },
            { icon: '💰', title: 'Doanh thu', value: formatVND(stats.totalRevenue), color: 'from-amber-500 to-orange-500' },
            { icon: '⏳', title: 'Chờ xác nhận', value: stats.pendingOrders, color: 'from-red-500 to-rose-500' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 shadow-xl text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-semibold mb-2">{stat.title}</p>
                  <p className="text-4xl font-black">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-6 text-center">
                <div className="text-5xl mb-3">{item.icon}</div>
                <p className="font-bold text-gray-800 group-hover:text-white transition-colors">{item.label}</p>
                {item.badge && (
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold text-white ${
                    item.badgeColor === 'red' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Doanh số hôm nay</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Đơn hàng</span>
                <span className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 20) + 5}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Doanh thu</span>
                <span className="text-xl font-bold text-blue-600">{formatVND(Math.floor(Math.random() * 5000000) + 1000000)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <span className="text-gray-700 font-semibold">Khách hàng mới</span>
                <span className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 10) + 2}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">⚡ Hành động nhanh</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/admin/products/new')} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-lg transition-all">
                ➕ Thêm sản phẩm mới
              </button>
              <button onClick={() => navigate('/admin/coupons/new')} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all">
                🎁 Tạo mã giảm giá
              </button>
              <button onClick={() => navigate('/admin/categories/new')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all">
                📂 Thêm danh mục
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
