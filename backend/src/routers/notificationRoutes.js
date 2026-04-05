const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/',                       ctrl.getAll);
router.patch('/read-all',             ctrl.markAllRead);
router.patch('/:id/read',             ctrl.markRead);
router.delete('/:id',                 ctrl.remove);

module.exports = router;
