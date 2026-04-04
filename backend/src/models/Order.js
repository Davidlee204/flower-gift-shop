const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },   // snapshot tên lúc đặt
  image:    { type: String },
  price:    { type: Number, required: true },   // snapshot giá lúc đặt
  quantity: { type: Number, required: true, min: 1 },
});

const deliverySchema = new mongoose.Schema({
  fullName:     { type: String, required: true },
  phone:        { type: String, required: true },
  street:       { type: String, required: true },
  district:     { type: String, required: true },
  city:         { type: String, required: true },
  deliveryDate: { type: Date,   required: true },
  deliveryTime: { type: String, required: true },   // '08:00-12:00'
  giftMessage:  { type: String, default: '' },
  isAnonymous:  { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    orderCode:      { type: String, unique: true },
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:          { type: [orderItemSchema], required: true },
    deliveryInfo:   { type: deliverySchema, required: true },

    subtotal:       { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee:    { type: Number, default: 30000 },
    total:          { type: Number, required: true },

    coupon:         { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },

    paymentMethod:  {
      type: String,
      enum: ['cod', 'vnpay', 'momo'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentRef: { type: String },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status:    { type: String },
        note:      { type: String },
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    cancelReason: { type: String },
    cancelledAt:  { type: Date },
  },
  { timestamps: true }
);

// Tự sinh orderCode trước khi lưu
orderSchema.pre('save', async function (next) {
  if (!this.orderCode) {
    const date  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments();
    this.orderCode = `FGS-${date}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'deliveryInfo.deliveryDate': 1 });

module.exports = mongoose.model('Order', orderSchema);
