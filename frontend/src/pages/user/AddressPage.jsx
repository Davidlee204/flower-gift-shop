// FGS-15: feat(FGS-15): thêm trang quản lý địa chỉ với CRUD operations
// FGS-15: feat(FGS-15): thêm trang quản lý địa chỉ
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validateAddress = (v) => {
  const err = {};
  if (!v.fullName?.trim())  err.fullName = 'Vui lòng nhập tên người nhận';
  if (!v.phone?.trim())     err.phone = 'Vui lòng nhập số điện thoại';
  else if (!/^(0|\+84)[0-9]{9}$/.test(v.phone)) err.phone = 'SĐT không hợp lệ';
  if (!v.street?.trim())    err.street = 'Vui lòng nhập địa chỉ';
  if (!v.district?.trim())  err.district = 'Vui lòng nhập quận/huyện';
  if (!v.city?.trim())      err.city = 'Vui lòng nhập tỉnh/thành phố';
  return err;
};

const AddressForm = ({ address, onSave, onCancel, loading }) => {
  const [values, setValues] = useState({
    label: 'Nhà',
    fullName: '',
    phone: '',
    street: '',
    district: '',
    city: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (address) {
      setValues({
        label: address.label || 'Nhà',
        fullName: address.fullName || '',
        phone: address.phone || '',
        street: address.street || '',
        district: address.district || '',
        city: address.city || '',
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validateAddress({ ...values, [name]: type === 'checkbox' ? checked : value })[name] }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validateAddress(values)[name] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateAddress(values);
    setErrors(errs);
    setTouched({ label: true, fullName: true, phone: true, street: true, district: true, city: true });
    if (Object.keys(errs).length) return;
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nhãn địa chỉ</label>
          <select name="label" value={values.label} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-100">
            <option value="Nhà">🏠 Nhà</option>
            <option value="Công ty">🏢 Công ty</option>
            <option value="Khác">📍 Khác</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isDefault" name="isDefault" checked={values.isDefault} onChange={handleChange}
            className="rounded border-gray-300" />
          <label htmlFor="isDefault" className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
        </div>
      </div>

      <Input label="Tên người nhận" name="fullName" required
        value={values.fullName} onChange={handleChange} onBlur={handleBlur} error={touched.fullName && errors.fullName} />

      <Input label="Số điện thoại" name="phone" required
        value={values.phone} onChange={handleChange} onBlur={handleBlur} error={touched.phone && errors.phone} />

      <Input label="Địa chỉ" name="street" required placeholder="Số nhà, đường, phường"
        value={values.street} onChange={handleChange} onBlur={handleBlur} error={touched.street && errors.street} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Quận/Huyện" name="district" required
          value={values.district} onChange={handleChange} onBlur={handleBlur} error={touched.district && errors.district} />

        <Input label="Tỉnh/Thành phố" name="city" required
          value={values.city} onChange={handleChange} onBlur={handleBlur} error={touched.city && errors.city} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {address ? 'Cập nhật' : 'Thêm địa chỉ'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
};

const AddressCard = ({ address, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">
          {address.label === 'Nhà' ? '🏠' : address.label === 'Công ty' ? '🏢' : '📍'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{address.label}</h3>
          {address.isDefault && (
            <span className="inline-block bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded mt-0.5">
              Mặc định
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(address)} 
          className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition">
          ✎
        </button>
        <button onClick={() => onDelete(address._id)}
          className="p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
          ✕
        </button>
      </div>
    </div>

    <div className="space-y-1.5 text-sm text-gray-600">
      <p className="font-medium text-gray-800">{address.fullName}</p>
      <p>{address.phone}</p>
      <p>{address.street}</p>
      <p>{address.district}, {address.city}</p>
    </div>
  </div>
);

const AddressPage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await userService.getAddresses();
      if (response.data?.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      alert('Không thể tải danh sách địa chỉ');
    }
  };

  const handleSave = async (addressData) => {
    setLoading(true);
    try {
      let response;
      if (editingAddress) {
        response = await userService.updateAddress(editingAddress._id, addressData);
      } else {
        response = await userService.addAddress(addressData);
      }

      if (response.data?.success) {
        await loadAddresses();
        setShowForm(false);
        setEditingAddress(null);
        alert('✓ ' + (editingAddress ? 'Cập nhật' : 'Thêm') + ' địa chỉ thành công');
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      const response = await userService.deleteAddress(addressId);
      if (response.data?.success) {
        await loadAddresses();
        alert('✓ Đã xóa địa chỉ');
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      alert(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý địa chỉ nhận hàng của bạn</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          + Thêm địa chỉ
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AddressForm
            address={editingAddress}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
            loading={loading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <AddressCard
            key={address._id}
            address={address}
            onEdit={(addr) => {
              setEditingAddress(addr);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-sm text-gray-500 mb-8">Thêm địa chỉ để đặt hàng thuận tiện hơn</p>
          <Button onClick={() => setShowForm(true)}>Thêm địa chỉ đầu tiên</Button>
        </div>
      )}
    </div>
  );
};

export default AddressPage;