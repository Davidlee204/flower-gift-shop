// FGS-12, 14: Danh sách sản phẩm với lọc, sắp xếp, phân trang
// Purpose: Hiển thị danh sách sản phẩm, cho phép lọc theo category, price, sort theo bestseller, newest, etc.
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { shopService } from '../services/shopService';
import api from '../services/axiosConfig';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition">
    <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden group">
      <img
        src={product.images?.[0] || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
      />
      {product.salePrice > 0 && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{Math.round((1 - product.salePrice / product.price) * 100)}%
        </span>
      )}
      {/* ✅ Nút yêu thích */}
      <button
        onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
        className="absolute top-2 left-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-600 rounded-full p-2 transition shadow-sm"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-lg text-pink-500">
          {formatVND(product.salePrice > 0 ? product.salePrice : product.price)}
        </span>
        {product.salePrice > 0 && (
          <span className="text-xs text-gray-400 line-through">{formatVND(product.price)}</span>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} className="w-full py-2 rounded bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition">
        Thêm vào giỏ
      </button>
    </div>
  </div>
);

const ProductListPage = () => {
  // State quản lý danh sách sản phẩm, filter, sort
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Query params từ URL (để lưu filter/sort state)
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy filter & sort từ URL params
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Load categories & products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const catRes = await shopService.getCategories();
        if (catRes.data?.success) setCategories(catRes.data.categories || []);

        // Fetch products với filter
        const params = {
          page: 1,
          limit: 12,
          ...(selectedCategory && { category: selectedCategory }),
          ...(sortBy && { sortBy }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        };
        const prodRes = await shopService.getProducts(params);
        if (prodRes.data?.success) setProducts(prodRes.data.products || []);
      } catch (err) {
        console.error('ProductList error:', err);
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, sortBy, minPrice, maxPrice]);

  // Xử lý thay đổi filter/sort
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item._id === product._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          _id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images?.[0],
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
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  // ✅ Handle adding product to wishlist
  const handleAddToWishlist = async (product) => {
    try {
      // Check if product is already in local wishlist
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = localWishlist.includes(product._id);

      if (exists) {
        // Remove from wishlist - API call + localStorage
        await api.delete(`/wishlist/${product._id}`);
        const updated = localWishlist.filter(id => id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        // ✅ Dispatch events for realtime badge update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { wishlist: updated } }));
        alert('✓ Đã xóa khỏi yêu thích');
      } else {
        // Add to wishlist - API call + localStorage
        const response = await api.post(`/wishlist/${product._id}`);
        if (response.data?.success) {
          localWishlist.push(product._id);
          localStorage.setItem('wishlist', JSON.stringify(localWishlist));
          // ✅ Dispatch events for realtime badge update
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { wishlist: localWishlist } }));
          alert('❤️ Đã thêm vào yêu thích');
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('Có lỗi xảy ra với danh sách yêu thích');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Sản phẩm</h1>
          <p className="text-gray-600">Tìm kiếm hoa tươi yêu thích của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Filter */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-sm sticky top-4">
              {/* Filter by Category */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Danh mục</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Price */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Khoảng giá</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm min-w-0"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm min-w-0"
                  />
                </div>
              </div>

              {/* Sort by */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Sắp xếp</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                  <option value="best_seller">Bán chạy</option>
                  <option value="rating">Đánh giá cao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/products/${product.slug}`)}
                    className="cursor-pointer"
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
