// FGS-12: feat(FGS-12): thêm trang đăng nhập/đăng xuất với auth context
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validate = (v) => {
  const err = {};
  if (!v.email.trim())             err.email = 'Vui lòng nhập email';
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Email không hợp lệ';
  if (!v.password)                 err.password = 'Vui lòng nhập mật khẩu';
  return err;
};

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPass, setShowPass] = useState(false);

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
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length) return;

    const result = await login(values);
    if (result.success) navigate('/');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
      <p className="text-sm text-gray-600 mb-8">Chào mừng bạn quay trở lại</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email" name="email" type="email" required
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={touched.email && errors.email} placeholder="you@email.com"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              name="password" type={showPass ? 'text' : 'password'}
              value={values.password} onChange={handleChange} onBlur={handleBlur}
              placeholder="Nhập mật khẩu"
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-gray-700">Ghi nhớ tôi</span>
          </label>
          <Link to="/forgot-password" className="text-pink-500 hover:text-pink-600 font-medium">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth className="mt-4">
          Đăng nhập
        </Button>
      </form>

      <hr className="my-6 border-gray-100" />
      <p className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-pink-500 font-semibold hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;