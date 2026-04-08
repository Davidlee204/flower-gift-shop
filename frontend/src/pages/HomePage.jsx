import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Thêm dòng này
import { shopService } from '../services/shopService';

const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';
const placeholderImage = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80';

const CategoryCard = ({ name, slug, image }) => (
  <Link to={`/categories/${slug}`}
    className="group relative h-32 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-end">
      <div className="w-full p-4">
        <h3 className="text-white font-semibold text-sm">{name}</h3>
      </div>
    </div>
  </Link>
);

const ProductCard = ({ name, price, salePrice, image, discount, mustHave }) => {
  const { t } = useTranslation();
  return (
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
            {t('home.bestseller')}
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
          {t('home.add_to_cart')}
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { t } = useTranslation(); // Thêm dòng này
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
        setError(t('home.error_load'));
      } finally {
        setLoadingCategories(false);
        setLoadingProducts(false);
      }
    };
    loadData();
  }, [t]);

  const categoryItems = loadingCategories
    ? Array.from({ length: 4 }, (_, i) => ({ id: i, name: t('home.loading'), slug: '', image: placeholderImage }))
    : categories;

  const productItems = loadingProducts
    ? Array.from({ length: 4 }, (_, i) => ({ id: i, name: t('home.loading'), price: 0, salePrice: 0, image: placeholderImage, discount: 0, mustHave: false }))
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
      <section className="relative bg-gradient-to-r from-pink-600 to-rose-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-20 w-40 h-40 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white blur-2xl"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                {t('hero.badge')}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-pink-100 text-lg mb-8 max-w-lg">
                {t('hero.subtitle')}
              </p>
              <div className="flex gap-4">
                <Link to="/products" className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                  {t('hero.btn_products')}
                </Link>
                <Link to="/register" className="bg-white/20 border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition">
                  {t('hero.btn_register')}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: '22+', label: t('stats.products') },
                { num: '5★', label: t('stats.reviews') },
                { num: '1K+', label: t('stats.customers') },
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

      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10 mb-16">
        <div className="bg-white rounded-full shadow-lg border border-gray-100 flex items-center gap-3 px-6 py-4">
          <span>🔍</span>
          <input type="text" placeholder={t('home.search_placeholder')} className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
          <Link to="/products" className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-6 py-2 rounded-full font-medium transition whitespace-nowrap">
            {t('home.btn_search')}
          </Link>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('home.cat_title')}</h2>
          <p className="text-gray-600">{t('home.cat_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {error && <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>}
          {categoryItems.map((c) => <CategoryCard key={c.id || c._id} {...c} />)}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('home.featured_title')}</h2>
          <p className="text-gray-600">{t('home.featured_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productItems.map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      </section>

      <section className="bg-white py-16 mb-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">{t('why.title')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: t('why.item1_title'), desc: t('why.item1_desc'), icon: '🌸' },
              { title: t('why.item2_title'), desc: t('why.item2_desc'), icon: '⚡' },
              { title: t('why.item3_title'), desc: t('why.item3_desc'), icon: '🎁' },
              { title: t('why.item4_title'), desc: t('why.item4_desc'), icon: '💬' },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="text-center">
                <div className="text-4xl mb-3">{icon}</div>
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