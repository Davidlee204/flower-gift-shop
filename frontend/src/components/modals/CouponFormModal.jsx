import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const CouponFormModal = ({ isOpen, onClose, onSuccess, editingCoupon }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    minOrderValue: '',
    usageLimit: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code || '',
        discountType: editingCoupon.discountType || 'percent',
        discountValue: editingCoupon.discountValue || '',
        minOrderValue: editingCoupon.minOrderValue || '',
        usageLimit: editingCoupon.usageLimit || '',
        expiryDate: editingCoupon.expiryDate ? editingCoupon.expiryDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        code: '',
        discountType: 'percent',
        discountValue: '',
        minOrderValue: '',
        usageLimit: '',
        expiryDate: ''
      });
    }
    setError('');
  }, [editingCoupon, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: formData.expiryDate || null
      };

      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon._id, submitData);
        alert('✓ Cập nhật mã giảm giá thành công');
      } else {
        await adminService.createCoupon(submitData);
        alert('✓ Thêm mã giảm giá thành công');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
      alert('❌ ' + (err.response?.data?.message || err.message || 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingCoupon ? '✏️ Chỉnh sửa mã giảm giá' : '➕ Thêm mã giảm giá'}
          </h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-gray-200">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Mã coupon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mã giảm giá *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="VD: SAVE20"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 uppercase"
              />
            </div>

            {/* Loại giảm giá */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Loại giảm giá *</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (₫)</option>
              </select>
            </div>

            {/* Giá trị giảm */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giá trị giảm {formData.discountType === 'percent' ? '(%)' : '(₫)'} *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Giá trị đơn hàng tối thiểu */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá tối thiểu (₫)</label>
              <input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Số lần sử dụng */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giới hạn sử dụng</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="Để trống = không giới hạn"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Ngày hết hạn */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ngày hết hạn</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Đang xử lý...' : editingCoupon ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;
