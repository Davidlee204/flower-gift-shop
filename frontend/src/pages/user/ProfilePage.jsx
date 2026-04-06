// FGS-14: feat(FGS-14): thêm trang hồ sơ cá nhân với form chỉnh sửa
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validate = (v) => {
  const err = {};
  if (!v.fullName?.trim())          err.fullName = 'Vui lòng nhập họ tên';
  if (!v.email?.trim())             err.email = 'Vui lòng nhập email';
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Email không hợp lệ';
  if (v.phone && !/^(0|\+84)[0-9]{9}$/.test(v.phone)) err.phone = 'SĐT không hợp lệ';
  return err;
};

const ProfilePage = () => {
  const { user, loading, updateUser } = useAuth();
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setValues({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(p => ({ ...p, [name]: value }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate({ ...values, [name]: value })[name] }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(values)[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ fullName: true, email: true, phone: true });
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const response = await userService.updateMe({
        fullName: values.fullName,
        phone: values.phone
      });

      if (response.data?.success) {
        const updatedUser = response.data?.user || response.data?.data || {
          ...user,
          fullName: values.fullName,
          phone: values.phone,
        };
        updateUser(updatedUser);
        setValues((prev) => ({
          ...prev,
          fullName: updatedUser.fullName || prev.fullName,
          phone: updatedUser.phone || prev.phone,
        }));
        alert('✓ Cập nhật hồ sơ thành công!');
      } else {
        setErrors({ general: response.data?.message || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setErrors({ general: message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Họ và tên" name="fullName" required
            value={values.fullName} onChange={handleChange} onBlur={handleBlur}
            error={touched.fullName && errors.fullName} placeholder="Nguyễn Văn A"
          />
          <Input
            label="Email" name="email" type="email" required
            value={values.email} onChange={handleChange} onBlur={handleBlur}
            error={touched.email && errors.email} placeholder="you@email.com"
            disabled
          />
          <Input
            label="Số điện thoại" name="phone"
            value={values.phone} onChange={handleChange} onBlur={handleBlur}
            error={touched.phone && errors.phone} placeholder="0901234567"
          />

          {errors.general && (
            <p className="text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-lg">{errors.general}</p>
          )}

          <Button type="submit" loading={saving} className="w-fit">
            Lưu thay đổi
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;