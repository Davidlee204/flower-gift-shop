// FGS-11: feat(FGS-11): thêm form đăng ký tài khoản với validation
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input  from '../../components/common/Input';
import Button from '../../components/common/Button';

const validate = (v) => {
  const err = {};
  if (!v.fullName.trim())          err.fullName = 'Vui lòng nhập họ tên';
  if (!v.email.trim())             err.email    = 'Vui lòng nhập email';
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Email không hợp lệ';
  if (!v.password)                 err.password = 'Vui lòng nhập mật khẩu';
  else if (v.password.length < 6)  err.password = 'Tối thiểu 6 ký tự';
  if (v.confirmPassword !== v.password) err.confirmPassword = 'Mật khẩu xác nhận không khớp';
  if (v.phone && !/^(0|\+84)[0-9]{9}$/.test(v.phone)) err.phone = 'SĐT không hợp lệ (VD: 0901234567)';
  return err;
};

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [values, setValues]   = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

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
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true, phone: true });
    if (Object.keys(errs).length) return;

    const { confirmPassword, ...payload } = values;
    const result = await register(payload);
    if (result.success) navigate('/');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản</h1>
      <p className="text-sm text-gray-600 mb-8">Bắt đầu hành trình mua hoa online</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Họ và tên" name="fullName" required
          value={values.fullName} onChange={handleChange} onBlur={handleBlur}
          error={touched.fullName && errors.fullName} placeholder="Nguyễn Văn A"
        />
        <Input
          label="Email" name="email" type="email" required
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={touched.email && errors.email} placeholder="you@email.com"
        />
        <Input
          label="Số điện thoại" name="phone"
          value={values.phone} onChange={handleChange} onBlur={handleBlur}
          error={touched.phone && errors.phone} placeholder="0901234567"
        />

        {/* Password với nút show/hide */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              name="password" type={showPass ? 'text' : 'password'}
              value={values.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="Tối thiểu 6 ký tự"
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition
                ${touched.password && errors.password
                  ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                  : 'border-gray-300 focus:border-pink-400 focus:ring-1 focus:ring-pink-100'}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              {showPass ? '✕' : '◉'}
            </button>
          </div>
          {touched.password && errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
        </div>

        <Input
          label="Xác nhận mật khẩu" name="confirmPassword"
          type={showPass ? 'text' : 'password'} required
          value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
          error={touched.confirmPassword && errors.confirmPassword}
          placeholder="Nhập lại mật khẩu"
        />

        {/* Strength indicator */}
        {values.password && (
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                values.password.length >= i * 3
                  ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                  : 'bg-gray-200'
              }`} />
            ))}
          </div>
        )}

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          Tạo tài khoản
        </Button>
      </form>

      <hr className="my-6 border-gray-100" />
      <p className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-pink-500 font-semibold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
