// FGS-06: Wishlist Page - Danh sách yêu thích
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/axiosConfig';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load wishlist from backend API
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/wishlist');
        console.log('Wishlist response:', response.data);
        
        if (response.data?.success) {
          // API returns {success: true, products: [...]}
          const products = response.data.products || [];
          setWishlist(Array.isArray(products) ? products : []);
          
          // ✅ Sync localStorage IDs với API response
          if (Array.isArray(products)) {
            const productIds = products.map(p => p._id);
            localStorage.setItem('wishlist', JSON.stringify(productIds));
            // Trigger badge update
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('wishlist:updated'));
          }
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Load wishlist error:', err);
        setError(err.response?.data?.message || 'Lỗi tải danh sách yêu thích');
        // Don't fallback to localStorage - show empty state instead
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
  }, [user]);

  // Remove item from wishlist
  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      const updated = wishlist.filter(item => item._id !== itemId);
      setWishlist(updated);
      
      // ✅ Cập nhật localStorage để badge cập nhật realtime
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const updatedLocal = localWishlist.filter(id => id !== itemId);
      localStorage.setItem('wishlist', JSON.stringify(updatedLocal));
      
      // ✅ Dispatch events để MainLayout update badge
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('wishlist:updated'));
      alert('✓ Đã xóa khỏi yêu thích');
    } catch (err) {
      alert('Lỗi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  // Add item to cart
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
          image: item.image || item.images?.[0],
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      // ✅ Dispatch events for realtime badge update
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
      alert('✓ Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Đăng nhập
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
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Danh sách yêu thích</h1>
          <p className="text-gray-600">Những sản phẩm bạn đang yêu thích</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Danh sách yêu thích trống</h2>
            <p className="text-gray-600 mb-6">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* Image */}
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

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3">{item.name}</h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-lg text-pink-500">
                      {formatVND(item.salePrice > 0 ? item.salePrice : item.price)}
                    </span>
                    {item.salePrice > 0 && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {formatVND(item.price)}
                        </span>
                        <span className="text-xs font-bold text-red-500">
                          -{Math.round((1 - item.salePrice / item.price) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/products/${item.slug}`)}
                      className="flex-1 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium transition"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition"
                    >
                      Thêm giỏ
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
