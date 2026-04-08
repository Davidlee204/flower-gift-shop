import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import
import { shopService } from '../services/shopService';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const ProductCard = ({ product, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
  >
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
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-bold text-pink-500">
          {formatVND(product.salePrice > 0 ? product.salePrice : product.price)}
        </span>
        {product.salePrice > 0 && (
          <span className="text-xs text-gray-400 line-through">{formatVND(product.price)}</span>
        )}
      </div>
    </div>
  </div>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(); // 2. Khai báo hook t

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const catRes = await shopService.getCategories();
        if (catRes.data?.success) {
          const found = catRes.data.categories.find((c) => c.slug === slug);
          if (found) {
            setCategory(found);
            const prodRes = await shopService.getProducts({
              category: found._id,
              sortBy,
              limit: 100,
            });
            if (prodRes.data?.success) {
              setProducts(prodRes.data.products || []);
            }
          }
        }
      } catch (err) {
        console.error('CategoryPage error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('category.not_found')}</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            {t('category.back_home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-pink-100 text-lg">
            {t('category.discover')} {products.length} {t('category.products_in_cat')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-600">
              {t('category.showing')} <span className="font-bold text-gray-800">{products.length}</span> {t('category.items')}
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500"
          >
            <option value="newest">{t('category.sort.newest')}</option>
            <option value="price_asc">{t('category.sort.price_asc')}</option>
            <option value="price_desc">{t('category.sort.price_desc')}</option>
            <option value="best_seller">{t('category.sort.best_seller')}</option>
            <option value="rating">{t('category.sort.rating')}</option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-gray-600 text-lg">{t('category.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onSelect={() => navigate(`/products/${product.slug}`)}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-pink-500 hover:text-pink-700 font-semibold"
          >
            ← {t('category.back_home')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;