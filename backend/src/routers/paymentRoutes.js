const router = require('express').Router();
const ctrl   = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/vnpay/create',       protect, ctrl.createVNPayUrl);
router.get('/vnpay/return',        ctrl.vnpayReturn);      // VNPay callback (không cần token)
router.get('/status/:orderId',     protect, ctrl.checkStatus);

module.exports = router;
