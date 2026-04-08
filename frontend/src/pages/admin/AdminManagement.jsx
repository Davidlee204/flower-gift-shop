// Admin Management Pages - Products, Orders, Users, Coupons, Categories
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import ProductFormModal from '../../components/modals/ProductFormModal';
import CouponFormModal from '../../components/modals/CouponFormModal';
import CategoryFormModal from '../../components/modals/CategoryFormModal';

// ─── Admin Product Management (FGS-26) ───
export const AdminProductsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadProducts();
    loadCategories();
  }, [user, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAdminProducts();
      // API có thể return { success, products } hoặc { data, products }
      const prods = response.data?.products || response.data?.data || response.data || [];
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi tải sản phẩm';
      setError('Lỗi: ' + message);
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminService.getAdminCategories();
      const cats = response.data?.data || response.data?.categories || response.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ✅ Thêm handlers CRUD với API
  const handleEdit = (productId) => {
    const product = products.find(p => p._id === productId);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      setLoading(true);
      await adminService.deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      alert('✓ Đã xóa sản phẩm');
    } catch (err) {
      setError('Lỗi xóa sản phẩm: ' + (err.response?.data?.message || err.message));
      alert('❌ Xóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    loadProducts();
  };

  return (
    <>
      <ProductFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingProduct={editingProduct}
        categories={categories}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black text-white">📦 Quản lý sản phẩm</h1>
            <button onClick={() => navigate('/products')} className="text-white underline hover:text-gray-300">
              ← Quay lại
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <button 
              onClick={handleAddProduct} 
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Thêm sản phẩm
            </button>
            <div className="lg:col-span-3">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {loading && <div className="text-center text-white py-12">⏳ Đang tải sản phẩm...</div>}

          {!loading && (
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Tên sản phẩm</th>
                    <th className="px-6 py-4 text-left">Giá</th>
                    <th className="px-6 py-4 text-left">Danh mục</th>
                    <th className="px-6 py-4 text-left">Kho</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, idx) => (
                    <tr key={product._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-700">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images ? <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded" /> : <span className="text-2xl">📦</span>}
                          <span className="font-bold text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-pink-600">{(product.price || 0).toLocaleString()}₫</td>
                      <td className="px-6 py-4">{product.category?.name || product.category || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-bold ${
                          (product.stock || 0) > 20 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {product.stock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => handleEdit(product._id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm transition">✏️ Sửa</button>
                      <button onClick={() => handleDelete(product._id)} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1 rounded-lg text-sm transition">🗑️ Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Admin Order Management (FGS-27) ───
export const AdminOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = () => {
    setLoading(true);
    try {
      setError('');
      // Lấy từ kho chung mà CheckoutPage đã lưu
      const savedOrders = JSON.parse(localStorage.getItem('all_orders') || '[]');
      setOrders(savedOrders);
    } catch (err) {
      setError('Lỗi tải đơn hàng từ hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers
  const handleViewDetails = (orderId) => {
    alert(`Xem chi tiết đơn hàng #${orderId}`);
  };

  // Dòng 147
const handleStatusChange = async (orderId, newStatus) => {
  try {
    setLoading(true);
    await adminService.updateOrderStatus(orderId, newStatus);
    setOrders(orders.map(o => 
      o._id === orderId ? { ...o, status: newStatus } : o
    ));
    alert('✓ Cập nhật trạng thái đơn hàng thành công');
  } catch (err) {
    setError('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    alert('❌ Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white">📋 Quản lý đơn hàng</h1>
          <button onClick={() => navigate('/orders')} className="text-white underline">← Quay lại</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {loading && <div className="text-center text-white py-12">⏳ Đang tải dơn hàng...</div>}

        {!loading && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Mã đơn</th>
                  <th className="px-6 py-4 text-left">Khách hàng</th>
                  <th className="px-6 py-4 text-left">Ngày đặt</th>
                  <th className="px-6 py-4 text-left">Tổng tiền</th>
                  <th className="px-6 py-4 text-left">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                    {/* Cột Mã đơn: Dùng order.id */}
                    <td className="px-6 py-4 font-bold text-gray-800">
                      #{order.id ? order.id.toString().slice(-8) : '---'}
                    </td>

                    {/* Cột Khách hàng: Dùng order.customerName */}
                    <td className="px-6 py-4 text-gray-700">
                      {order.customerName || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>

                    {/* Cột Tổng tiền: Dùng order.total */}
                    <td className="px-6 py-4 font-bold text-pink-600">
                      {(order.total || 0).toLocaleString()}₫
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full font-bold border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="shipping">shipping</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Chỗ này cũng phải là order.id */}
                      <button onClick={() => handleViewDetails(order.id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm transition">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

// ─── Admin User Management (FGS-28) ───
export const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAdminUsers();
      const users = response.data?.data || response.data?.users || response.data || [];
      setUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi tải người dùng';
      setError('Lỗi: ' + message);
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers
  const handleViewUser = (userId) => {
    alert(`Xem thông tin user #${userId}`);
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Thay đổi vai trò thành ${newRole}?`)) return;
    try {
      setLoading(true);
      await adminService.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      alert('✓ Cập nhật vai trò thành công');
    } catch (err) {
      setError('Lỗi cập nhật vai trò: ' + (err.response?.data?.message || err.message));
      alert('❌ Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn khóa user này?')) return;
    try {
      setLoading(true);
      await adminService.lockUser(userId);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: false } : u
      ));
      alert('✓ Đã khóa user');
    } catch (err) {
      setError('Lỗi khóa user: ' + (err.response?.data?.message || err.message));
      alert('❌ Khóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockUser = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn mở khóa user này?')) return;
    try {
      setLoading(true);
      await adminService.unlockUser(userId);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: true } : u
      ));
      alert('✓ Đã mở khóa user');
    } catch (err) {
      setError('Lỗi mở khóa user: ' + (err.response?.data?.message || err.message));
      alert('❌ Mở khóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white">👥 Quản lý người dùng</h1>
          <button onClick={() => navigate('/')} className="text-white underline">← Quay lại</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {loading && <div className="text-center text-white py-12">⏳ Đang tải người dùng...</div>}

        {!loading && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">#</th>
                  <th className="px-6 py-4 text-left">Tên</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">SĐT</th>
                  <th className="px-6 py-4 text-left">Ngày tham gia</th>
                  <th className="px-6 py-4 text-left">Vai trò</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-700">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{u.fullName || u.name}</td>
                    <td className="px-6 py-4 text-gray-700">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className={`px-3 py-1 rounded-full font-bold border-0 cursor-pointer ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">⚙️ Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center space-x-1">
                      <button onClick={() => handleViewUser(u._id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-2 py-1 rounded-lg text-sm transition">
                        Xem
                      </button>
                      {u.isActive ? (
                        <button onClick={() => handleLockUser(u._id)} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-2 py-1 rounded-lg text-sm transition">
                          Khóa
                        </button>
                      ) : (
                        <button onClick={() => handleUnlockUser(u._id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-2 py-1 rounded-lg text-sm transition">
                          Mở
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Admin Coupon Management (FGS-29) ───
export const AdminCouponsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadCoupons();
  }, [user, navigate]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAdminCoupons();
      const coupons = response.data?.data || response.data?.coupons || response.data || [];
      setCoupons(Array.isArray(coupons) ? coupons : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi tải mã giảm giá';
      setError('Lỗi: ' + message);
      console.error('Load coupons error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers
  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEditCoupon = (couponId) => {
    const coupon = coupons.find(c => c._id === couponId);
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Xóa mã giảm giá này?')) return;
    try {
      setLoading(true);
      await adminService.deleteCoupon(couponId);
      setCoupons(coupons.filter(c => c._id !== couponId));
      alert('✓ Đã xóa mã giảm giá');
    } catch (err) {
      setError('Lỗi xóa mã giảm giá: ' + (err.response?.data?.message || err.message));
      alert('❌ Xóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleModalSuccess = () => {
    loadCoupons();
  };

  return (
    <>
      <CouponFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingCoupon={editingCoupon}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black text-white">🎁 Quản lý mã giảm giá</h1>
            <button onClick={handleAddCoupon} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              ➕ Thêm mã
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {loading && <div className="text-center text-white py-12">⏳ Đang tải mã giảm giá...</div>}

          {!loading && (
            <div className="grid md:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <div key={coupon._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-2xl font-black text-purple-600 mb-2">{coupon.code}</h3>
                  <p className="text-gray-600 mb-3 font-bold">
                    {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}₫`}
                  </p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Sử dụng: {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{
                        width: coupon.usageLimit ? `${((coupon.usageCount || 0) / coupon.usageLimit) * 100}%` : '0%'
                      }}></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCoupon(coupon._id)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-lg text-sm transition">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-2 rounded-lg text-sm transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Admin Category Management (FGS-30) ───
export const AdminCategoriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAdminCategories();
      const cats = response.data?.data || response.data?.categories || response.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Lỗi tải danh mục';
      setError('Lỗi: ' + message);
      console.error('Load categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (catId) => {
    const category = categories.find(c => c._id === catId);
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      setLoading(true);
      await adminService.deleteCategory(catId);
      setCategories(categories.filter(c => c._id !== catId));
      alert('✓ Đã xóa danh mục');
    } catch (err) {
      setError('Lỗi xóa danh mục: ' + (err.response?.data?.message || err.message));
      alert('❌ Xóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    loadCategories();
  };

  return (
    <>
      <CategoryFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingCategory={editingCategory}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black text-white">📂 Quản lý danh mục</h1>
            <button onClick={handleAddCategory} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
              ➕ Thêm danh mục
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {loading && <div className="text-center text-white py-12">⏳ Đang tải danh mục...</div>}

          {!loading && (
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat._id} className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">📂</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
                      <p className="text-sm text-gray-600">{cat.products || 0} sản phẩm</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEditCategory(cat._id)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-lg transition">
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
