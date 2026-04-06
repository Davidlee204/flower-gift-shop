// ReviewModal - Modal để đánh giá sản phẩm
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ReviewModal = ({ product, isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét');
      return;
    }

    setLoading(true);
    try {
      // Save to localStorage
      const reviewData = {
        id: Date.now(),
        productId: product._id,
        productSlug: product.slug,
        productName: product.name,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        userName: user?.fullName || 'Anonymous'
      };

      const reviews = JSON.parse(localStorage.getItem(`reviews_${user?._id || 'guest'}`) || '[]');
      reviews.push(reviewData);
      localStorage.setItem(`reviews_${user?._id || 'guest'}`, JSON.stringify(reviews));

      alert('✓ Cảm ơn đánh giá của bạn!');
      onSubmit?.();
      setComment('');
      setRating(5);
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{product.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số sao</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét của bạn</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
            >
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
