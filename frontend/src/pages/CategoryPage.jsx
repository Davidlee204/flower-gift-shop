// FGS-17: Xem danh mục - trang hiển thị sản phẩm theo danh mục được chọn
// Purpose: Khi click vào một danh mục, hiển thị tất cả sản phẩm trong danh mục đó + lọc
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  // Lấy category slug từ URL params
  const { slug } = useParams();
  const navigate = useNavigate();

  // State quản lý category & danh sách sản phẩm
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  // Load category & products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Lấy tất cả categories và tìm theo slug
        const catRes = await shopService.getCategories();
        if (catRes.data?.success) {
          const found = catRes.data.categories.find((c) => c.slug === slug);
          if (found) {
            setCategory(found);

            // Lấy sản phẩm của category này
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
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Danh mục không tồn tại</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category header banner */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-pink-100 text-lg">
            Khám phá {products.length} sản phẩm trong danh mục này
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gray-600">
              Hiển thị <span className="font-bold text-gray-800">{products.length}</span> sản phẩm
            </p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-pink-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="best_seller">Bán chạy</option>
            <option value="rating">Đánh giá cao</option>
          </select>
        </div>

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌸</div>
            <p className="text-gray-600 text-lg">Hiện tại không có sản phẩm trong danh mục này</p>
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

        {/* Breadcrumb back */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-pink-500 hover:text-pink-700 font-semibold"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
