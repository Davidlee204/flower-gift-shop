// FGS-13: feat(FGS-13): thêm trang quên mật khẩu
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const validate = (v) => {
  const err = {};
  if (!v.email.trim())             err.email = 'Vui lòng nhập email';
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = 'Email không hợp lệ';
  return err;
};

const ForgotPasswordPage = () => {
  const [values, setValues] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setTouched({ email: true });
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // TODO: Call API forgot password
      // const response = await api.post('/auth/forgot-password', values);
      // if (response.data.success) setSuccess(true);

      // Temporary: simulate success
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setErrors({ email: 'Có lỗi xảy ra, vui lòng thử lại' });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email đã được gửi!</h1>
        <p className="text-sm text-gray-600 mb-2">
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
        </p>
        <p className="font-semibold text-gray-800 mb-6">{values.email}</p>
        <p className="text-xs text-gray-500 mb-8">
          Nếu không thấy email trong hộp thư đến, vui lòng kiểm tra thư rác (spam).
        </p>
        <Link to="/login"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold transition">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Quên mật khẩu</h1>
      <p className="text-sm text-gray-500 mb-6">
        Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email" name="email" type="email" required
          value={values.email} onChange={handleChange} onBlur={handleBlur}
          error={touched.email && errors.email} placeholder="you@email.com"
        />

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          Gửi hướng dẫn
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link to="/login" className="text-pink-500 font-medium hover:underline">
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;