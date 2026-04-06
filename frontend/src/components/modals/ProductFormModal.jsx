import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const ProductFormModal = ({ isOpen, onClose, onSuccess, editingProduct, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    stock: '',
    images: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        salePrice: editingProduct.salePrice || '',
        category: editingProduct.category?._id || editingProduct.category || '',
        stock: editingProduct.stock || '',
        images: editingProduct.images?.join(',') || '',
        tags: editingProduct.tags?.join(',') || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        category: '',
        stock: '',
        images: '',
        tags: ''
      });
    }
    setError('');
  }, [editingProduct, isOpen]);

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
        description: formData.description,
        price: parseFloat(formData.price),
        salePrice: parseFloat(formData.salePrice),
        category: formData.category,
        stock: parseInt(formData.stock),
        images: formData.images.split(',').filter(img => img.trim()),
        tags: formData.tags.split(',').filter(tag => tag.trim())
      };

      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, submitData);
        alert('✓ Cập nhật sản phẩm thành công');
      } else {
        await adminService.createProduct(submitData);
        alert('✓ Thêm sản phẩm thành công');
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
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingProduct ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
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
            {/* Tên sản phẩm */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Hoa hồng đỏ"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Giá */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá gốc (₫) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Giá sale */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Giá sale (₫)</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Số lượng kho */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Số lượng kho *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Links hình ảnh */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">URL hình ảnh (cách nhau bằng dấu phẩy)</label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tags (cách nhau bằng dấu phẩy)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tươi, tặng quà, dịp lễ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
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
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Đang xử lý...' : editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
