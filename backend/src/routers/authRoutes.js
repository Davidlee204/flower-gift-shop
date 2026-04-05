const router = require('express').Router();

const {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword,
} = require('../controllers/authController');

const {
  getMe, updateMe,
  getAddresses, addAddress, updateAddress, deleteAddress,
} = require('../controllers/userController');

const {
  validateRegister, validateLogin,
  validateForgotPassword, validateResetPassword,
  validateAddress,
} = require('../validators/authValidator');

const { protect } = require('../middlewares/authMiddleware');

// ── FGS-41 Đăng ký ───────────────────────────────────────────────────────────
router.post('/register', validateRegister, register);

// ── FGS-42 Đăng nhập / Đăng xuất / Refresh ───────────────────────────────────
router.post('/login',         validateLogin, login);
router.post('/logout',        protect, logout);
router.post('/refresh-token', refreshToken);

// ── FGS-43 Quên / Đặt lại mật khẩu ──────────────────────────────────────────
router.post('/forgot-password',          validateForgotPassword, forgotPassword);
router.post('/reset-password/:token',    validateResetPassword,  resetPassword);

module.exports = router;


// ─────────────────────────────────────────────────────────────────────────────
// Tách riêng userRoutes để mount tại /api/users
// ─────────────────────────────────────────────────────────────────────────────
const userRouter = require('express').Router();

// ── FGS-44 Hồ sơ cá nhân ─────────────────────────────────────────────────────
userRouter.get('/me',    protect, getMe);
userRouter.patch('/me',  protect, updateMe);

// // ── FGS-45 Quản lý địa chỉ ───────────────────────────────────────────────────
// userRouter.get('/me/addresses',        protect, getAddresses);
// userRouter.post('/me/addresses',       protect, validateAddress, addAddress);
// userRouter.put('/me/addresses/:id',    protect, validateAddress, updateAddress);
// userRouter.delete('/me/addresses/:id', protect, deleteAddress);

module.exports.userRouter = userRouter;
