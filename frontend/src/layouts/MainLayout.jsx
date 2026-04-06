import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // ✅ Cập nhật số lượng giỏ hàng
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    // ✅ Update ngay khi component mount
    updateCartCount();
    updateWishlistCount();

    // ✅ Lắng nghe storage event (khi thay đổi từ tab khác)
    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
    };

    // ✅ Lắng nghe custom event (khi thay đổi từ tab hiện tại)
    const handleCartUpdated = () => {
      updateCartCount();
    };

    const handleWishlistUpdated = () => {
      updateWishlistCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart:updated', handleCartUpdated);
    window.addEventListener('wishlist:updated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart:updated', handleCartUpdated);
      window.removeEventListener('wishlist:updated', handleWishlistUpdated);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-pink-500">
            <span className="text-2xl">🌸</span>
            <span className="hidden sm:block">Flower Gift</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link to="/"          className="hover:text-pink-500 transition">Trang chủ</Link>
            <Link to="/products"  className="hover:text-pink-500 transition">Sản phẩm</Link>
            <Link to="/categories"className="hover:text-pink-500 transition">Danh mục</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-pink-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {/* ✅ Badge số lượng wishlist */}
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-pink-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {/* ✅ Badge số lượng giỏ hàng */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {user && (
              <Link to="/notifications" className="p-2 text-gray-600 hover:text-pink-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 transition text-sm"
                >
                          <span className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">
                      {(user.fullName || user.name || 'U')[0]?.toUpperCase()}
                    </span>
                    <span className="hidden sm:block text-gray-700 max-w-[100px] truncate">{user.fullName || user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to="/profile"  onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>👤</span> Hồ sơ cá nhân
                    </Link>
                    <Link to="/addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>📍</span> Địa chỉ
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>❤️</span> Danh sách yêu thích
                    </Link>
                    <Link to="/reviews" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>⭐</span> Đánh giá của tôi
                    </Link>
                    <Link to="/orders"   onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>📦</span> Đơn hàng
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-pink-600 hover:bg-pink-50 font-medium">
                        <span>⚙️</span> Quản trị
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50">
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="text-sm text-gray-600 hover:text-pink-500 transition">Đăng nhập</Link>
                <Link to="/register" className="text-sm bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
          <div>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>🌸</span> Flower Gift System
            </div>
            <p>Giao hoa tươi và quà tặng tận nơi, đúng giờ, đúng cảm xúc.</p>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2">Liên kết</div>
            <ul className="space-y-1">
              <li><Link to="/"         className="hover:text-pink-500 transition">Trang chủ</Link></li>
              <li><Link to="/products" className="hover:text-pink-500 transition">Sản phẩm</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2">Hỗ trợ</div>
            <p>📞 1900 xxxx</p>
            <p>✉️ support@flowergift.vn</p>
          </div>
        </div>
        <div className="border-t border-gray-100 text-center text-xs text-gray-400 py-3">
          © 2026 Flower Gift Shop
        </div>
      </footer>

      {/* Đóng dropdown khi click ra ngoài */}
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default MainLayout;
