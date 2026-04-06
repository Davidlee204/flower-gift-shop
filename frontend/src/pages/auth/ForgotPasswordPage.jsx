// FGS-03: Forgot Password - Simple 2-step flow: email verification + password reset
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: email, Step 2: password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (e) => {
    if (!e.trim()) return 'Vui lòng nhập email';
    if (!/^\S+@\S+\.\S+$/.test(e)) return 'Email không hợp lệ';
    return '';
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError('');
    setLoading(true);
    // Simulate verification
    await new Promise(r => setTimeout(r, 800));
    setStep(2);
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    if (!confirmPassword.trim()) {
      setPasswordError('Vui lòng xác nhận mật khẩu');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu không khớp');
      return;
    }
    setPasswordError('');
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    alert('✓ Mật khẩu đã được đặt lại. Đăng nhập với mật khẩu mới.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
      {step === 1 ? (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🔐</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-gray-600 text-lg">Nhập email để xác minh danh tính</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📧 Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  placeholder="example@gmail.com"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition text-gray-700 font-medium"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-rose-500 flex items-center gap-2 font-semibold">
                    <span>⚠️</span> {emailError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-105"
              >
                {loading ? '🔄 Đang xử lý...' : '✓ Tiếp tục'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="text-pink-600 font-bold hover:text-rose-600 transition underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-pulse">🔑</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                Đặt mật khẩu mới
              </h1>
              <p className="text-gray-600">
                <span className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full inline-block font-semibold">
                  {email}
                </span>
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔐 Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">✓ Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none transition text-gray-700 font-medium"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-rose-600 flex items-center gap-2 bg-rose-50 px-5 py-3 rounded-xl font-semibold border border-rose-200">
                  <span>⚠️</span> {passwordError}
                </p>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-105"
              >
                {loading ? '🔄 Đang xử lý...' : '✓ Đặt lại mật khẩu'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                className="w-full border-2 border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600 font-bold py-2 rounded-xl transition"
              >
                ← Quay lại
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
              <p>💡 <span className="font-semibold">Mật khẩu phải ít nhất 6 ký tự</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;