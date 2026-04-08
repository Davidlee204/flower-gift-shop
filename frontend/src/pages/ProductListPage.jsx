import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Thêm import
import { shopService } from '../services/shopService';
import api from '../services/axiosConfig';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const ProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  const { t } = useTranslation(); // Thêm hook cho component con
  return (
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
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }} 
          className="w-full py-2 rounded bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition"
        >
          {t('home.add_to_cart')}
        </button>
      </div>
    </div>
  );
};

const ProductListPage = () => {
  const { t } = useTranslation(); // 2. Khai báo hook t
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const catRes = await shopService.getCategories();
        if (catRes.data?.success) setCategories(catRes.data.categories || []);

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
        setError(t('product_list.error_load'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, sortBy, minPrice, maxPrice, t]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item._id === product._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, image: product.images?.[0], quantity: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cart:updated'));
      alert(`✓ ${t('product_detail.add_success_msg', { qty: 1 })}`);
    } catch (error) {
      alert(t('common.error'));
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const exists = localWishlist.includes(product._id);

      if (exists) {
        await api.delete(`/wishlist/${product._id}`);
        const updated = localWishlist.filter(id => id !== product._id);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('wishlist:updated'));
        alert(`✓ ${t('product_detail.wishlist_removed')}`);
      } else {
        const response = await api.post(`/wishlist/${product._id}`);
        if (response.data?.success) {
          localWishlist.push(product._id);
          localStorage.setItem('wishlist', JSON.stringify(localWishlist));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('wishlist:updated'));
          alert(`❤️ ${t('product_detail.wishlist_added')}`);
        }
      }
    } catch (error) {
      alert(t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('nav.products')}</h1>
          <p className="text-gray-600">{t('product_list.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-sm sticky top-4">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">{t('nav.categories')}</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="">{t('product_list.all_cats')}</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">{t('product_list.price_range')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t('product_list.from')}
                    value={minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t('product_list.to')}
                    value={maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">{t('product_list.sort_title')}</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                >
                  <option value="newest">{t('category.sort.newest')}</option>
                  <option value="price_asc">{t('category.sort.price_asc')}</option>
                  <option value="price_desc">{t('category.sort.price_desc')}</option>
                  <option value="best_seller">{t('category.sort.best_seller')}</option>
                  <option value="rating">{t('category.sort.rating')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <p className="text-gray-600 mt-4">{t('product_detail.loading')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">{t('product_list.no_products')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} onClick={() => navigate(`/products/${product.slug}`)} className="cursor-pointer">
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