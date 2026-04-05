const router = require('express').Router();
const ctrl   = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/search',              ctrl.search);
router.get('/featured',            ctrl.getFeatured);
router.get('/',                    ctrl.getAll);
router.get('/:id',                 ctrl.getOne);
router.get('/:id/related',         ctrl.getRelated);

// Reviews (nested under product)
router.get('/:productId/reviews',         reviewCtrl.getByProduct);
router.post('/:productId/reviews', protect, reviewCtrl.create);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.post('/',    protect, adminOnly, ctrl.create);
router.put('/:id',  protect, adminOnly, ctrl.update);
router.delete('/:id', protect, adminOnly, ctrl.remove);

module.exports = router;
