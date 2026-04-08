import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Import
import api from '../services/axiosConfig';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(); // 2. Hook i18n
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/wishlist');
        
        if (response.data?.success) {
          const products = response.data.products || [];
          setWishlist(Array.isArray(products) ? products : []);
          
          if (Array.isArray(products)) {
            const productIds = products.map(p => p._id);
            localStorage.setItem('wishlist', JSON.stringify(productIds));
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('wishlist:updated'));
          }
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Load wishlist error:', err);
        setError(err.response?.data?.message || t('wishlist_page.error_load'));
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user, t]);

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      const updated = wishlist.filter(item => item._id !== itemId);
      setWishlist(updated);
      
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedLocal = localWishlist.filter(id => id !== itemId);
      localStorage.setItem('wishlist', JSON.stringify(updatedLocal));
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('wishlist:updated'));
      alert(t('product_detail.wishlist_removed'));
    } catch (err) {
      alert(t('common.error') + ': ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddToCart = (item) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find(c => c._id === item._id);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          _id: item._id,
          slug: item.slug,
          name: item.name,
          price: item.price,
          salePrice: item.salePrice,
          image: item.images?.[0] || item.image,
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cart:updated'));
      alert(t('product_detail.add_success_msg', { qty: 1 }));
    } catch (error) {
      alert(t('common.error'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('wishlist_page.login_required')}</h1>
          <p className="text-gray-600 mb-6">{t('wishlist_page.login_desc')}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {t('nav.login')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('menu.wishlist')}</h1>
          <p className="text-gray-600">{t('wishlist_page.subtitle')}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('wishlist_page.empty_title')}</h2>
            <p className="text-gray-600 mb-6">{t('wishlist_page.empty_desc')}</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {t('cart.continue_shopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden group">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white hover:bg-gray-100 shadow-md flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg text-pink-500">
                      {formatVND(item.salePrice > 0 ? item.salePrice : item.price)}
                    </span>
                    {item.salePrice > 0 && (
                      <>
                        <span className="text-sm text-gray-400 line-through">{formatVND(item.price)}</span>
                        <span className="text-xs font-bold text-red-500">
                          -{Math.round((1 - item.salePrice / item.price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/products/${item.slug}`)}
                      className="flex-1 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium transition"
                    >
                      {t('review_page.view_product_link')}
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition"
                    >
                      {t('home.add_to_cart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;