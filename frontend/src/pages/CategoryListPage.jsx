import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Thêm import
import { shopService } from '../services/shopService';

const CategoryCard = ({ slug, name, image }) => (
  <Link to={`/categories/${slug}`} className="group rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition bg-white">
    <div className="relative h-52 overflow-hidden">
      <img src={image || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600'} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
      </div>
    </div>
  </Link>
);

const CategoryListPage = () => {
  const { t } = useTranslation(); // 2. Khai báo hook t
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await shopService.getCategories();
        if (response.data?.success) {
          setCategories(response.data.categories || []);
        } else {
          setError(response.data?.message || t('category_list.error_default'));
        }
      } catch (err) {
        console.error('CategoryListPage error:', err);
        setError(t('category_list.error_fetch'));
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <p className="text-sm text-pink-500 font-semibold mb-2">{t('category_list.badge')}</p>
          <h1 className="text-4xl font-bold text-gray-900">{t('category_list.title')}</h1>
          <p className="text-gray-600 mt-3">{t('category_list.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-600">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category._id} {...category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListPage;