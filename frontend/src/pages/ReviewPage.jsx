import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // 1. Thêm import

const ReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation(); // 2. Khai báo hook t
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const saved = localStorage.getItem(`reviews_${user._id}`);
      setMyReviews(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleDeleteReview = (reviewId) => {
    // Sử dụng i18n cho thông báo xác nhận
    if (!confirm(t('review_page.confirm_delete'))) return;

    const updated = myReviews.filter(r => r.id !== reviewId);
    setMyReviews(updated);
    localStorage.setItem(`reviews_${user._id}`, JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('review_page.title')}</h1>
          <p className="text-gray-600">{t('review_page.subtitle')}</p>
        </div>

        {myReviews.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('review_page.empty_title')}</h2>
            <p className="text-gray-600 mb-6">{t('review_page.empty_desc')}</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {t('review_page.view_products_btn')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{review.productName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-yellow-400">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        {Array.from({ length: 5 - review.rating }).map((_, i) => (
                          <span key={i} className="text-gray-300">★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <button
                  onClick={() => navigate(`/products/${review.productSlug}`)}
                  className="text-pink-500 hover:text-pink-600 font-semibold text-sm"
                >
                  {t('review_page.view_product_link')} →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;