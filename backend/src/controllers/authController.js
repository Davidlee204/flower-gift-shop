const crypto    = require('crypto');
const User      = require('../models/User');
const AppError  = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

// ── Helper: gửi token về client ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Lưu refreshToken vào DB để có thể invalidate khi logout
  User.findByIdAndUpdate(user._id, { refreshToken }).exec();

  res.status(statusCode).json({
    success:      true,
    accessToken,
    refreshToken,
    user,
  });
};

// ── FGS-41: POST /api/auth/register ──────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return next(new AppError('Email đã được sử dụng', 400));

    const user = await User.create({ fullName, email, password, phone });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── FGS-42: POST /api/auth/login ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Lấy user kèm password (vì password có select: false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return next(new AppError('Email hoặc mật khẩu không đúng', 401));

    if (!user.isActive)
      return next(new AppError('Tài khoản đã bị khoá, vui lòng liên hệ hỗ trợ', 403));

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── FGS-42: POST /api/auth/logout ────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    // Xoá refreshToken khỏi DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) {
    next(err);
  }
};

// ── FGS-42: POST /api/auth/refresh-token ─────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Không có refresh token', 401));

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({ _id: decoded.id }).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return next(new AppError('Refresh token không hợp lệ', 401));

    const newAccessToken = generateAccessToken(user._id);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    next(new AppError('Refresh token hết hạn, vui lòng đăng nhập lại', 401));
  }
};

// ── FGS-43: POST /api/auth/forgot-password ───────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (!user) return next(new AppError('Không tìm thấy tài khoản với email này', 404));

    // Tạo reset token 32 bytes
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to:      user.email,
        subject: 'Đặt lại mật khẩu - Flower Gift System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
            <h2 style="color: #e91e8c;">Đặt lại mật khẩu</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu. Link có hiệu lực trong <strong>15 phút</strong>.</p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 24px;background:#e91e8c;color:#fff;border-radius:6px;text-decoration:none;margin:16px 0;">
              Đặt lại mật khẩu
            </a>
            <p style="color:#888;font-size:13px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });

      res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi' });
    } catch {
      // Rollback nếu gửi email thất bại
      user.resetPasswordToken   = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      next(new AppError('Gửi email thất bại, vui lòng thử lại', 500));
    }
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/reset-password/:token ─────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return next(new AppError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400));

    user.password             = req.body.password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken         = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
