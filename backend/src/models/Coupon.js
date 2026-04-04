const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type:     String,
      required: [true, 'Vui lòng nhập mã coupon'],
      unique:   true,
      uppercase: true,
      trim:     true,
    },
    description:   { type: String, default: '' },
    type:          { type: String, enum: ['percent', 'fixed'], required: true },
    value:         { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount:   { type: Number, default: 0 },   // 0 = không giới hạn
    usageLimit:    { type: Number, default: 0 },   // 0 = không giới hạn
    usedCount:     { type: Number, default: 0 },
    startDate:     { type: Date,   required: true },
    endDate:       { type: Date,   required: true },
    isActive:      { type: Boolean, default: true },
    usedBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Kiểm tra coupon còn hiệu lực không
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === 0 || this.usedCount < this.usageLimit)
  );
};

// Tính số tiền được giảm
couponSchema.methods.calcDiscount = function (subtotal) {
  if (!this.isValid()) return 0;
  if (subtotal < this.minOrderValue) return 0;

  let discount =
    this.type === 'percent'
      ? Math.floor((subtotal * this.value) / 100)
      : this.value;

  if (this.maxDiscount > 0) discount = Math.min(discount, this.maxDiscount);
  return discount;
};

module.exports = mongoose.model('Coupon', couponSchema);
