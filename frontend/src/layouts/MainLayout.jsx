import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // ĐÃ THÊM: Biến lưu số lượng thông báo chưa đọc
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

  // Logic đếm Giỏ hàng & Yêu thích
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

    updateCartCount();
    updateWishlistCount();

    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
    };

    const handleCartUpdated = () => updateCartCount();
    const handleWishlistUpdated = () => updateWishlistCount();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart:updated', handleCartUpdated);
    window.addEventListener('wishlist:updated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart:updated', handleCartUpdated);
      window.removeEventListener('wishlist:updated', handleWishlistUpdated);
    };
  }, []);

  // ĐÃ THÊM: Logic đếm Thông báo chưa đọc
  useEffect(() => {
    const checkUnread = () => {
      if (user) {
        const notifs = JSON.parse(localStorage.getItem(`notifications_${user._id}`) || '[]');
        const count = notifs.filter(n => !n.read).length;
        setUnreadCount(count);
      } else {
        setUnreadCount(0);
      }
    };

    checkUnread(); 
    window.addEventListener('storage', checkUnread); 
    
    return () => window.removeEventListener('storage', checkUnread);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-pink-500">
            <span className="text-2xl">🌸</span>
            <span className="hidden sm:block">Flower Gift</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-pink-500 transition">{t('nav.home')}</Link>
            <Link to="/products" className="hover:text-pink-500 transition">{t('nav.products')}</Link>
            <Link to="/categories" className="hover:text-pink-500 transition">{t('nav.categories')}</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-pink-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-pink-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* ĐÃ THÊM: Notification Icon */}
            {user && (
              <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-pink-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 transition text-sm ml-2"
                >
                  <span className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">
                    {(user.fullName || user.name || 'U')[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-gray-700 max-w-[100px] truncate">{user.fullName || user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>👤</span> {t('menu.profile')}
                    </Link>
                    <Link to="/addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>📍</span> {t('menu.address')}
                    </Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>❤️</span> {t('menu.wishlist')}
                    </Link>
                    <Link to="/reviews" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>⭐</span> {t('menu.reviews')}
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50">
                      <span>📦</span> {t('menu.orders')}
                    </Link>
                    
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={toggleLanguage}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-base">{i18n.language === 'vi' ? '🇺🇸' : '🇻🇳'}</span>
                      <span className="font-medium text-blue-600">
                        {i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                      </span>
                    </button>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-pink-600 hover:bg-pink-50 font-medium border-t border-gray-100">
                        <span>⚙️</span> {t('menu.admin')}
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50">
                      <span>🚪</span> {t('menu.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-pink-500 transition">{t('nav.login')}</Link>
                <Link to="/register" className="text-sm bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition">{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-500">
          <div>
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span>🌸</span> Flower Gift System
            </div>
            <p>{t('footer.description')}</p>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2">{t('footer.links')}</div>
            <ul className="space-y-1">
              <li><Link to="/" className="hover:text-pink-500 transition">{t('nav.home')}</Link></li>
              <li><Link to="/products" className="hover:text-pink-500 transition">{t('nav.products')}</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-2">{t('footer.support')}</div>
            <p>📞 1900 xxxx</p>
            <p>✉️ support@flowergift.vn</p>
          </div>
        </div>
        <div className="border-t border-gray-100 text-center text-xs text-gray-400 py-3">
          © 2026 Flower Gift Shop
        </div>
      </footer>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default MainLayout;