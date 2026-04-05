const router = require('express').Router();
const ctrl   = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);                            // tất cả route đều cần đăng nhập
router.get('/',                      ctrl.get);
router.post('/:productId',           ctrl.add);
router.delete('/clear',              ctrl.clear);
router.delete('/:productId',         ctrl.remove);

module.exports = router;
