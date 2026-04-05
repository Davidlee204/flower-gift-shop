// Sprint 2 — Notification API
const Notification = require('../models/Notification');

// GET /api/notifications
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments({ user: req.user._id }),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
    ]);

    res.json({ success: true, total, unread, page: Number(page), notifications });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read — đánh dấu 1 thông báo đã đọc
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all — đánh dấu tất cả đã đọc
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
exports.remove = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Đã xoá thông báo' });
  } catch (err) { next(err); }
};

// Utility: gửi thông báo (dùng nội bộ trong orderController)
exports.sendNotification = async ({ userId, title, message, type, link, refId }) => {
  await Notification.create({ user: userId, title, message, type, link, refId });
};
