const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    order:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    comment:    { type: String, default: '', maxlength: 500 },
    images:     [{ type: String }],
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Mỗi user chỉ review 1 lần cho 1 đơn hàng
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

// Sau khi lưu → cập nhật ratingAvg và ratingCount của Product
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(this.product, {
      ratingAvg:   Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }
});

// Sau khi xoá → cập nhật lại rating
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: doc.product } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(doc.product, {
    ratingAvg:   stats.length ? Math.round(stats[0].avg * 10) / 10 : 0,
    ratingCount: stats.length ? stats[0].count : 0,
  });
});

module.exports = mongoose.model('Review', reviewSchema);
