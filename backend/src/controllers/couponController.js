const Coupon   = require('../models/Coupon');
const AppError = require('../utils/AppError');

// POST /api/coupons/apply — áp dụng mã giảm giá
exports.apply = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !subtotal) return next(new AppError('code và subtotal là bắt buộc', 400));

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return next(new AppError('Mã giảm giá không tồn tại', 404));
    if (!coupon.isValid()) return next(new AppError('Mã giảm giá đã hết hạn hoặc đã dùng hết', 400));

    // Kiểm tra user đã dùng chưa
    if (coupon.appliedBy?.includes(req.user._id))
      return next(new AppError('Bạn đã sử dụng mã này rồi', 400));

    if (subtotal < coupon.minOrderValue)
      return next(new AppError(
        `Đơn tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫ để dùng mã này`, 400
      ));

    const discountAmount = coupon.calcDiscount(subtotal);

    res.json({
      success: true,
      coupon: {
        _id:            coupon._id,
        code:           coupon.code,
        type:           coupon.type,
        value:          coupon.value,
        discountAmount,
        finalTotal:     subtotal - discountAmount,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/coupons — danh sách coupon (admin)
exports.getAll = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, total: coupons.length, coupons });
  } catch (err) { next(err); }
};

// POST /api/coupons — tạo coupon (admin)
exports.create = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) { next(err); }
};

// PUT /api/coupons/:id — sửa coupon (admin)
exports.update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return next(new AppError('Không tìm thấy coupon', 404));
    res.json({ success: true, coupon });
  } catch (err) { next(err); }
};

// DELETE /api/coupons/:id — xoá (admin)
exports.remove = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá coupon' });
  } catch (err) { next(err); }
};
