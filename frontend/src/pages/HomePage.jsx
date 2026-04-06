// FGS-54: feat(FGS-54): thiết kế homepage UI với hero section và categories
// Cập nhật: lấy dữ liệu categories + featured products từ backend API
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../services/shopService';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

const placeholderImage = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80';

// Component Category Card — hiển thị ảnh thay vì icon
const CategoryCard = ({ name, slug, image }) => (
  <Link to={`/categories/${slug}`}
    className="group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
    {/* Overlay tối */}
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-end">
      <div className="w-full p-4">
        <h3 className="text-white font-semibold text-sm">{name}</h3>
      </div>
    </div>
  </Link>
);

// Component Product Card — hiển thị giá đúng với seed
const ProductCard = ({ name, price, salePrice, image, discount, mustHave }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group overflow-hidden">
    <div className="relative overflow-hidden h-48">
      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      {discount > 0 && (
        <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          -{discount}%
        </span>
      )}
      {mustHave && (
        <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          Bestseller
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3 min-h-[36px]">{name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="font-bold text-lg text-pink-500">
          {formatVND(salePrice > 0 ? salePrice : price)}
        </span>
        {salePrice > 0 && (
          <span className="text-xs text-gray-400 line-through">{formatVND(price)}</span>
        )}
      </div>
      <button className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition">
        Thêm vào giỏ
      </button>
    </div>
  </div>
);

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setError(null);
      try {
        const [categoryRes, featuredRes] = await Promise.all([
          shopService.getCategories(),
          shopService.getFeaturedProducts(8),
        ]);

        if (categoryRes.data?.success) setCategories(categoryRes.data.categories || []);
        if (featuredRes.data?.success) setFeaturedProducts(featuredRes.data.products || []);
      } catch (err) {
        console.error('HomePage API error', err);
        setError('Không thể tải dữ liệu từ server. Vui lòng thử lại sau.');
      } finally {
        setLoadingCategories(false);
        setLoadingProducts(false);
      }
    };

    loadData();
  }, []);

  const categoryItems = loadingCategories
    ? Array.from({ length: 4 }, (_, i) => ({ id: i, name: 'Đang tải...', slug: '', image: placeholderImage }))
    : categories;

  const productItems = loadingProducts
    ? Array.from({ length: 4 }, (_, i) => ({ id: i, name: 'Đang tải...', price: 0, salePrice: 0, image: placeholderImage, discount: 0, mustHave: false }))
    : featuredProducts.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || 0,
      image: product.images?.[0] || placeholderImage,
      discount: product.salePrice > 0 ? Math.round((1 - product.salePrice / product.price) * 100) : 0,
      mustHave: product.isFeatured || product.salePrice > 0,
    }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero Section ── */}
    <section className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-20 w-40 h-40 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white blur-2xl"></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Nội dung */}
          <div>
            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              ✨ Giao hoa trong 2 giờ — Nội thành TP.HCM
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Gửi yêu thương qua từng đóa hoa
            </h1>
            <p className="text-pink-100 text-lg mb-8 max-w-lg">
              Hoa tươi cao cấp + Giao đúng giờ + Yêu thương chân thành. Đặt hôm nay, nhận hôm nay!
            </p>
            <div className="flex gap-4">
              <Link to="/products"
                className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Xem sản phẩm
              </Link>
              <Link to="/register"
                className="bg-white/20 border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition">
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '22+', label: 'Sản phẩm' },
              { num: '5★', label: 'Đánh giá' },
              { num: '1K+', label: 'Khách hàng' },
            ].map(({ num, label }) => (
              <div key={num} className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
                <div className="text-3xl font-bold">{num}</div>
                <div className="text-sm text-pink-100 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── Search Bar ── */}
    <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 mb-16">
      <div className="bg-white rounded-full shadow-lg border border-gray-100 flex items-center gap-3 px-6 py-4">
        <span>🔍</span>
        <input
          type="text" placeholder="Tìm hoa, quà tặng, dịp lễ..."
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
        <Link to="/products" className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-6 py-2 rounded-full font-medium transition whitespace-nowrap">
          Tìm kiếm
        </Link>
      </div>
    </div>

    {/* ── Categories ── */}
    <section className="max-w-6xl mx-auto px-4 mb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Danh mục nổi bật</h2>
        <p className="text-gray-600">Chọn từ 8 danh mục hoa và quà tặng</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {error && (
          <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        )}
        {categoryItems.map((c) => <CategoryCard key={c.id || c._id} {...c} />)}
      </div>
    </section>

    {/* ── Featured Products ── */}
    <section className="max-w-6xl mx-auto px-4 mb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
        <p className="text-gray-600">Top 4 sản phẩm bán chạy nhất tuần này</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productItems.map((p) => <ProductCard key={p.id} {...p} />)}
      </div>
    </section>

    {/* ── Why Choose Us ── */}
    <section className="bg-white py-16 mb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Tại sao chọn Flower Gift?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { title: 'Hoa tươi 100%', desc: 'Nhập trực tiếp từ vườn hoa hàng ngày' },
            { title: 'Giao nhanh', desc: 'Trong 2 giờ nội thành TP.HCM' },
            { title: 'Gói quà miễn phí', desc: 'Với tất cả đơn hàng' },
            { title: 'Hỗ trợ 24/7', desc: 'Chat, gọi, email hỗ trợ liên tục' },
          ].map(({ title, desc }) => (
            <div key={title} className="text-center">
              <div className="text-4xl mb-3">
                {title.includes('tươi') ? '🌸' : title.includes('nhanh') ? '⚡' : title.includes('Gói') ? '🎁' : '💬'}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
};

export default HomePage;
