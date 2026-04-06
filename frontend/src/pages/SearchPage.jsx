// FGS-09: Tìm kiếm sản phẩm
// Purpose: Cho phép người dùng tìm kiếm sản phẩm theo từ khoá, hiển thị kết quả tìm kiếm
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { shopService } from '../services/shopService';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const SearchPage = () => {
  // Lấy query từ URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();

  // Thực hiện tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  // Load kết quả tìm kiếm khi query thay đổi
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q?.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        // Gọi API search endpoint
        const res = await shopService.searchProducts(q, 1, 50);
        if (res.data?.success) {
          setResults(res.data.products || []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm, dịp lễ..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {!searchParams.get('q')?.trim() ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">Hãy nhập từ khoá để tìm kiếm sản phẩm</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-gray-600 mb-6">
              Không có sản phẩm nào khớp với "{searchParams.get('q')}"
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Kết quả tìm kiếm cho "{searchParams.get('q')}" ({results.length} kết quả)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product.slug}`)}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden group">
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
