const AppError = require('../utils/AppError');

// ── Helper ────────────────────────────────────────────────────────────────────
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const isValidPhone = (phone) => /^(0|\+84)[0-9]{9}$/.test(phone);

// ── FGS-41 Validate đăng ký ───────────────────────────────────────────────────
const validateRegister = (req, res, next) => {
  const { fullName, email, password, phone } = req.body;
  const errors = [];

  if (!fullName?.trim())               errors.push('Vui lòng nhập họ tên');
  if (!email?.trim())                  errors.push('Vui lòng nhập email');
  else if (!isValidEmail(email))       errors.push('Email không hợp lệ');
  if (!password)                       errors.push('Vui lòng nhập mật khẩu');
  else if (password.length < 6)        errors.push('Mật khẩu tối thiểu 6 ký tự');
  if (phone && !isValidPhone(phone))   errors.push('Số điện thoại không hợp lệ (VD: 0901234567)');

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

// // ── FGS-42 Validate đăng nhập ─────────────────────────────────────────────────
// const validateLogin = (req, res, next) => {
//   const { email, password } = req.body;
//   const errors = [];

//   if (!email?.trim())           errors.push('Vui lòng nhập email');
//   else if (!isValidEmail(email)) errors.push('Email không hợp lệ');
//   if (!password)                errors.push('Vui lòng nhập mật khẩu');

//   if (errors.length) return next(new AppError(errors.join(', '), 400));
//   next();
// };

// // ── FGS-43 Validate quên mật khẩu ────────────────────────────────────────────
// const validateForgotPassword = (req, res, next) => {
//   const { email } = req.body;
//   if (!email?.trim() || !isValidEmail(email))
//     return next(new AppError('Vui lòng nhập email hợp lệ', 400));
//   next();
// };

// // ── Validate đặt lại mật khẩu ────────────────────────────────────────────────
// const validateResetPassword = (req, res, next) => {
//   const { password, confirmPassword } = req.body;
//   if (!password || password.length < 6)
//     return next(new AppError('Mật khẩu tối thiểu 6 ký tự', 400));
//   if (password !== confirmPassword)
//     return next(new AppError('Mật khẩu xác nhận không khớp', 400));
//   next();
// };

// // ── Validate địa chỉ (dùng cho FGS-45) ───────────────────────────────────────
// const validateAddress = (req, res, next) => {
//   const { fullName, phone, street, district, city } = req.body;
//   const errors = [];

//   if (!fullName?.trim())         errors.push('Vui lòng nhập tên người nhận');
//   if (!phone?.trim())            errors.push('Vui lòng nhập số điện thoại');
//   else if (!isValidPhone(phone)) errors.push('Số điện thoại không hợp lệ');
//   if (!street?.trim())           errors.push('Vui lòng nhập địa chỉ');
//   if (!district?.trim())         errors.push('Vui lòng nhập quận/huyện');
//   if (!city?.trim())             errors.push('Vui lòng nhập tỉnh/thành phố');

//   if (errors.length) return next(new AppError(errors.join(', '), 400));
//   next();
// };

// module.exports = {
//   validateRegister,
//   validateLogin,
//   validateForgotPassword,
//   validateResetPassword,
//   validateAddress,
// };
