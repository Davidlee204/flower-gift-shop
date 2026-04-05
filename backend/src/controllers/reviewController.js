// Sprint 2 — Review API
const Review   = require('../models/Review');
const Order    = require('../models/Order');
const AppError = require('../utils/AppError');

// GET /api/products/:productId/reviews
exports.getByProduct = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId })
        .populate('user', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    res.json({ success: true, total, page: Number(page), reviews });
  } catch (err) { next(err); }
};

// POST /api/products/:productId/reviews
exports.create = async (req, res, next) => {
  try {
    const { orderId, rating, comment, images } = req.body;
    if (!orderId)        return next(new AppError('orderId là bắt buộc', 400));
    if (!rating)         return next(new AppError('rating là bắt buộc', 400));
    if (rating < 1 || rating > 5)
      return next(new AppError('Rating phải từ 1 đến 5', 400));

    // Kiểm tra đơn hàng tồn tại, thuộc về user này và đã giao
    const order = await Order.findOne({
      _id:    orderId,
      user:   req.user._id,
      status: 'delivered',
    });
    if (!order) return next(new AppError('Đơn hàng không hợp lệ hoặc chưa được giao', 400));

    // Kiểm tra sp có trong đơn không
    const inOrder = order.items.some(i => i.product.toString() === req.params.productId);
    if (!inOrder) return next(new AppError('Sản phẩm không có trong đơn hàng này', 400));

    const review = await Review.create({
      product: req.params.productId,
      user:    req.user._id,
      order:   orderId,
      rating,
      comment,
      images,
    });

    await review.populate('user', 'fullName avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000)
      return next(new AppError('Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi', 400));
    next(err);
  }
};

// DELETE /api/reviews/:id
exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return next(new AppError('Không tìm thấy đánh giá', 404));
    await review.deleteOne();
    res.json({ success: true, message: 'Đã xoá đánh giá' });
  } catch (err) { next(err); }
};
