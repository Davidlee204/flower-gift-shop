import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shopService } from '../services/shopService';
import ReviewModal from '../components/ReviewModal';
import api from '../services/axiosConfig'; // ĐÃ THÊM: Import api để gọi Backend

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await shopService.getProducts({ limit: 100 });
        if (res.data?.success) {
          const found = res.data.products.find((p) => p.slug === slug);
          if (found) {
            setProduct(found);
            const related = await shopService.getProducts({
              category: found.category._id || found.category,
              limit: 4,
            });
            if (related.data?.success) {
              setRelatedProducts(related.data.products.filter((p) => p._id !== found._id));
            }
          }
        }
      } catch (err) {
        console.error('ProductDetail error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">{t('product_detail.loading', 'Đang tải...')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('product_detail.not_found', 'Không tìm thấy sản phẩm')}</h1>
          <button
            onClick={() => navigate('/products')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            {t('product_detail.back_to_list', 'Quay lại danh sách')}
          </button>
        </div>
      </div>
    );
  }

  const discount = product.salePrice > 0 ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item._id === product._id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({
          _id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images?.[0],
          quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cart:updated'));
      alert(`✓ ${t('product_detail.add_success_msg', { qty: quantity })}`);
      setQuantity(1);
    } catch (error) {
      console.error('Add to cart error:', error);
      alert(t('common.error', 'Có lỗi xảy ra'));
    }
  };

  // ĐÃ SỬA: Hàm gọi API Backend để Thêm/Xóa yêu thích
  const handleAddToWishlist = async () => {
    try {
      const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      // Kiểm tra xem sản phẩm đã có trong LocalStorage chưa
      const isAlreadyLiked = currentWishlist.includes(product._id) || 
                             currentWishlist.some(item => item._id === product._id);

      let response;

      // Gọi API tương ứng
      if (isAlreadyLiked) {
        response = await api.delete(`/wishlist/${product._id}`);
      } else {
        response = await api.post(`/wishlist/${product._id}`);
      }
      
      // Đồng bộ lại dữ liệu
      if (response.data?.success) {
        // Chỉ lưu mảng ID để đồng bộ với trang WishlistPage
        const productIds = response.data.products.map(p => p._id || p);
        localStorage.setItem('wishlist', JSON.stringify(productIds));

        // Bắn sự kiện cập nhật số lượng
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('wishlist:updated'));

        if (isAlreadyLiked) {
          alert(`💔 ${t('product_detail.wishlist_removed', 'Đã xóa khỏi danh sách yêu thích')}`);
        } else {
          alert(`❤️ ${t('product_detail.wishlist_added', 'Đã thêm vào danh sách yêu thích')}`);
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      if (error.response?.status === 401) {
        alert(t('wishlist_page.login_required', 'Vui lòng đăng nhập để sử dụng tính năng này!'));
        navigate('/login');
      } else {
        alert(t('common.error', 'Có lỗi xảy ra, vui lòng thử lại'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-pink-500">
            {t('nav.home', 'Trang chủ')}
          </button>
          {' / '}
          <button onClick={() => navigate('/products')} className="hover:text-pink-500">
            {t('nav.products', 'Sản phẩm')}
          </button>
          {' / '}
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={product.images?.[activeImage] || 'https://via.placeholder.com/500'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded border-2 overflow-hidden ${
                      activeImage === idx ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`view ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-500">★★★★★</span>
                <span className="text-gray-600 ml-2">({product.ratingCount || 0} {t('product_detail.reviews', 'đánh giá')})</span>
              </div>
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? t('product_detail.in_stock', 'Còn hàng') : t('product_detail.out_of_stock', 'Hết hàng')}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-pink-500">
                  {formatVND(product.salePrice > 0 ? product.salePrice : product.price)}
                </span>
                {product.salePrice > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">{formatVND(product.price)}</span>
                    <span className="text-lg font-bold text-red-500">-{discount}%</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Quantity & Actions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('product_detail.quantity', 'Số lượng')}</label>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded border border-gray-300 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart} 
                disabled={product.stock === 0} 
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg mb-2 transition"
              >
                🛒 {t('product_detail.add_cart_btn', 'Thêm vào giỏ hàng')} ({quantity})
              </button>
              <button 
                onClick={handleAddToWishlist} 
                className="w-full border-2 border-pink-500 text-pink-500 hover:bg-pink-50 font-bold py-3 rounded-lg transition mb-2"
              >
                ❤️ {t('product_detail.wishlist_btn', 'Yêu thích')}
              </button>
              <button 
                onClick={() => setShowReviewModal(true)} 
                className="w-full border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 font-bold py-3 rounded-lg transition mb-4"
              >
                ⭐ {t('product_detail.write_review_btn', 'Viết đánh giá')}
              </button>
              <div className="border-t pt-4 text-sm text-gray-600">
                <p>✓ {t('cart.feature1', 'Giao hàng tận nơi')}</p>
                <p>✓ {t('cart.feature2', 'Tặng kèm thiệp')}</p>
                <p>✓ {t('cart.feature3', 'Đảm bảo hoa tươi')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('product_detail.related_title', 'Sản phẩm liên quan')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/products/${p.slug}`)}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="relative h-40 bg-gray-200 overflow-hidden group">
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{p.name}</h3>
                    <span className="font-bold text-pink-500">{formatVND(p.salePrice > 0 ? p.salePrice : p.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReviewModal
        product={product}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  );
};

export default ProductDetailPage;