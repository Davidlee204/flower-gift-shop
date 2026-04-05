const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.use(protect);
router.post('/',                  ctrl.create);          // Checkout
router.get('/',                   ctrl.getMyOrders);     // Lịch sử đơn
router.get('/:id',                ctrl.getById);         // Chi tiết đơn
router.get('/:id/tracking',       ctrl.tracking);        // Theo dõi
router.post('/:id/cancel',        ctrl.cancel);          // Huỷ đơn

// Admin
router.get('/admin/all',          adminOnly, ctrl.adminGetAll);
router.patch('/:id/status',       adminOnly, ctrl.updateStatus);

module.exports = router;
