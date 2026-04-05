const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order_confirmed', 'order_preparing', 'order_delivering',
             'order_delivered', 'order_cancelled', 'promotion', 'system'],
      default: 'system',
    },
    isRead:  { type: Boolean, default: false },
    link:    { type: String, default: '' },
    refId:   { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
