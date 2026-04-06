const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const AppError = require('../utils/AppError');

// ── Xác thực Access Token ─────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // Lấy token từ header
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError('Vui lòng đăng nhập để tiếp tục', 401));

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy user từ DB (bỏ qua password)
    const user = await User.findById(decoded.id);
    if (!user)          return next(new AppError('Tài khoản không tồn tại', 401));
    if (!user.isActive) return next(new AppError('Tài khoản đã bị khoá', 403));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return next(new AppError('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 401));
    next(new AppError('Token không hợp lệ', 401));
  }
};

// ── Chỉ Admin ─────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
  next();
};

module.exports = { protect, adminOnly };
