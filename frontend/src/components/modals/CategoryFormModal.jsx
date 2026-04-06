import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const CategoryFormModal = ({ isOpen, onClose, onSuccess, editingCategory }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        image: editingCategory.image || '',
        description: editingCategory.description || ''
      });
    } else {
      setFormData({
        name: '',
        image: '',
        description: ''
      });
    }
    setError('');
  }, [editingCategory, isOpen]);

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
        name: formData.name,
        image: formData.image,
        description: formData.description
      };

      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, submitData);
        alert('✓ Cập nhật danh mục thành công');
      } else {
        await adminService.createCategory(submitData);
        alert('✓ Thêm danh mục thành công');
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
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingCategory ? '✏️ Chỉnh sửa danh mục' : '➕ Thêm danh mục'}
          </h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-gray-200">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tên danh mục *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Hoa hồng"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          {/* URL hình ảnh */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">URL hình ảnh</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/category-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
            {formData.image && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-2">Xem trước:</p>
                <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả danh mục..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
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
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Đang xử lý...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
