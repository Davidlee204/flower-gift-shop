// Sprint 3 — Order API
// Tasks: Checkout, Xác nhận đơn, Lịch sử đơn, Chi tiết đơn, Theo dõi, Huỷ đơn
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Coupon   = require('../models/Coupon');
const AppError = require('../utils/AppError');
const { sendNotification } = require('./notificationController');

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  preparing:  'Đang chuẩn bị',
  delivering: 'Đang giao hàng',
  delivered:  'Đã giao',
  cancelled:  'Đã huỷ',
};

// ── POST /api/orders — tạo đơn hàng (checkout) ───────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const { items, deliveryInfo, paymentMethod, couponCode } = req.body;
    if (!items?.length)   return next(new AppError('Giỏ hàng trống', 400));
    if (!deliveryInfo)    return next(new AppError('Thông tin giao hàng là bắt buộc', 400));

    // Lấy thông tin sản phẩm từ DB để tính giá chính xác
    const productIds = items.map(i => i.productId);
    const products   = await Product.find({ _id: { $in: productIds }, isActive: true });

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product)           return next(new AppError(`Sản phẩm ${item.productId} không tồn tại`, 400));
      if (product.stock < item.quantity)
        return next(new AppError(`Sản phẩm "${product.name}" không đủ hàng`, 400));

      const price = product.salePrice > 0 ? product.salePrice : product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0] || '',
        price,
        quantity: item.quantity,
      });
    }

    // Áp dụng coupon nếu có
    let discountAmount = 0;
    let couponDoc      = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (couponDoc && couponDoc.isValid() && !couponDoc.appliedBy?.includes(req.user._id)) {
        discountAmount = couponDoc.calcDiscount(subtotal);
      }
    }

    const shippingFee = 30000;
    const total       = subtotal - discountAmount + shippingFee;

    // Tạo đơn hàng
    const order = await Order.create({
      user:           req.user._id,
      items:          orderItems,
      deliveryInfo,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      coupon:         couponDoc?._id,
      paymentMethod:  paymentMethod || 'cod',
      statusHistory:  [{ status: 'pending', note: 'Đơn hàng vừa được tạo', updatedBy: req.user._id }],
    });

    // Cập nhật coupon: tăng usedCount + ghi user đã dùng
    if (couponDoc) {
      couponDoc.usedCount += 1;
      couponDoc.appliedBy.push(req.user._id);
      await couponDoc.save();
    }

    // Giảm stock sản phẩm
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Gửi thông báo
    await sendNotification({
      userId:  req.user._id,
      title:   'Đặt hàng thành công!',
      message: `Đơn hàng ${order.orderCode} đã được tạo. Tổng: ${total.toLocaleString('vi-VN')}₫`,
      type:    'order_confirmed',
      link:    `/orders/${order._id}`,
      refId:   order._id,
    });

    await order.populate('items.product', 'name images');
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// ── GET /api/orders — lịch sử đơn của user ───────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip   = (Number(page) - 1) * Number(limit);
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-statusHistory'),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id — chi tiết đơn hàng ──────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('coupon', 'code type value');

    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id/tracking — theo dõi trạng thái ───────────────────────
exports.tracking = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .select('orderCode status statusHistory deliveryInfo.deliveryDate deliveryInfo.deliveryTime paymentStatus');

    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));

    // Tạo timeline từ statusHistory
    const allStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'];
    const currentIdx  = allStatuses.indexOf(order.status);

    const timeline = allStatuses.map((s, i) => {
      const record = order.statusHistory.find(h => h.status === s);
      return {
        status:    s,
        label:     STATUS_LABELS[s],
        done:      i <= currentIdx && order.status !== 'cancelled',
        current:   s === order.status,
        updatedAt: record?.updatedAt || null,
        note:      record?.note || null,
      };
    });

    res.json({ success: true, orderCode: order.orderCode, status: order.status, timeline });
  } catch (err) { next(err); }
};

// ── POST /api/orders/:id/cancel — huỷ đơn ───────────────────────────────────
exports.cancel = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));

    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status))
      return next(new AppError('Không thể huỷ đơn ở trạng thái này', 400));

    order.status       = 'cancelled';
    order.cancelReason = req.body.reason || 'Khách hàng huỷ';
    order.cancelledAt  = new Date();
    order.statusHistory.push({
      status:    'cancelled',
      note:      req.body.reason || 'Khách hàng huỷ đơn',
      updatedBy: req.user._id,
    });
    await order.save();

    // Hoàn stock sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    // Thông báo
    await sendNotification({
      userId:  req.user._id,
      title:   'Đơn hàng đã bị huỷ',
      message: `Đơn hàng ${order.orderCode} đã được huỷ thành công.`,
      type:    'order_cancelled',
      link:    `/orders/${order._id}`,
      refId:   order._id,
    });

    res.json({ success: true, message: 'Đã huỷ đơn hàng', order });
  } catch (err) { next(err); }
};

// ── PATCH /api/orders/:id/status (admin) — cập nhật trạng thái ───────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return next(new AppError('Trạng thái không hợp lệ', 400));

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));

    order.status = status;
    order.statusHistory.push({ status, note: note || STATUS_LABELS[status], updatedBy: req.user._id });

    if (status === 'cancelled') {
      order.cancelReason = note;
      order.cancelledAt  = new Date();
    }
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    await order.save();

    // Gửi thông báo cho user
    const notifTypes = {
      confirmed:  'order_confirmed',
      preparing:  'order_preparing',
      delivering: 'order_delivering',
      delivered:  'order_delivered',
      cancelled:  'order_cancelled',
    };

    await sendNotification({
      userId:  order.user,
      title:   `Đơn hàng ${STATUS_LABELS[status].toLowerCase()}`,
      message: `Đơn ${order.orderCode}: ${note || STATUS_LABELS[status]}`,
      type:    notifTypes[status],
      link:    `/orders/${order._id}`,
      refId:   order._id,
    });

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ── GET /api/admin/orders (admin) — tất cả đơn hàng ─────────────────────────
exports.adminGetAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip   = (Number(page) - 1) * Number(limit);
    const filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-statusHistory'),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) { next(err); }
};
