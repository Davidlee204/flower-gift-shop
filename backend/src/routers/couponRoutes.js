const router = require('express').Router();
const ctrl   = require('../controllers/couponController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/apply',  protect, ctrl.apply);            // User áp dụng mã

// Admin CRUD
router.get('/',        protect, adminOnly, ctrl.getAll);
router.post('/',       protect, adminOnly, ctrl.create);
router.put('/:id',     protect, adminOnly, ctrl.update);
router.delete('/:id',  protect, adminOnly, ctrl.remove);

module.exports = router;
