// Sprint 3 — Payment API (VNPay)
const crypto   = require('crypto');
const Order    = require('../models/Order');
const AppError = require('../utils/AppError');

// ── Tạo URL thanh toán VNPay ──────────────────────────────────────────────────
exports.createVNPayUrl = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));
    if (order.paymentStatus === 'paid')
      return next(new AppError('Đơn hàng đã được thanh toán', 400));

    const tmnCode   = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    const vnpUrl    = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    const date    = new Date();
    const createDate = date.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const txnRef  = `${order.orderCode}-${Date.now()}`;

    const params = {
      vnp_Version:     '2.1.0',
      vnp_Command:     'pay',
      vnp_TmnCode:     tmnCode,
      vnp_Amount:      String(order.total * 100),    // VNPay nhân x100
      vnp_BankCode:    '',
      vnp_CreateDate:  createDate,
      vnp_CurrCode:    'VND',
      vnp_IpAddr:      req.ip || '127.0.0.1',
      vnp_Locale:      'vn',
      vnp_OrderInfo:   `Thanh toan don hang ${order.orderCode}`,
      vnp_OrderType:   'other',
      vnp_ReturnUrl:   returnUrl,
      vnp_TxnRef:      txnRef,
    };

    // Sắp xếp params theo alphabet rồi tạo chữ ký
    const sortedParams = Object.keys(params).sort().reduce((acc, k) => {
      acc[k] = params[k]; return acc;
    }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${hmac}`;

    // Lưu txnRef vào đơn để đối soát
    await Order.findByIdAndUpdate(orderId, { paymentRef: txnRef });

    res.json({ success: true, paymentUrl });
  } catch (err) { next(err); }
};

// ── VNPay Return URL — callback sau khi thanh toán ───────────────────────────
exports.vnpayReturn = async (req, res, next) => {
  try {
    const params    = { ...req.query };
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const secretKey = process.env.VNPAY_HASH_SECRET;
    const sortedParams = Object.keys(params).sort().reduce((acc, k) => {
      acc[k] = params[k]; return acc;
    }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    const checkHash = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');

    if (checkHash !== secureHash) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=error&message=Chữ ký không hợp lệ`);
    }

    const txnRef  = params.vnp_TxnRef;
    const responseCode = params.vnp_ResponseCode;

    const order = await Order.findOne({ paymentRef: { $regex: txnRef.split('-')[0] } });

    if (responseCode === '00' && order) {
      order.paymentStatus = 'paid';
      order.statusHistory.push({ status: order.status, note: 'Thanh toán VNPay thành công' });
      await order.save();
      return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=success&orderId=${order._id}`);
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment-result?status=failed&orderId=${order?._id || ''}`);
  } catch (err) { next(err); }
};

// ── Kiểm tra trạng thái thanh toán ──────────────────────────────────────────
exports.checkStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id })
      .select('paymentStatus paymentMethod paymentRef orderCode');
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404));
    res.json({ success: true, paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod });
  } catch (err) { next(err); }
};
