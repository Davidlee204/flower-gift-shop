const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Vui lòng nhập tên sản phẩm'], trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: [true, 'Vui lòng nhập giá'], min: 0 },
    salePrice:   { type: Number, default: 0, min: 0 },   // 0 = không khuyến mãi
    images:      [{ type: String }],
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags:        [{ type: String }],
    occasion:    [{ type: String }],                      // ['birthday', 'valentine', '83']
    stock:       { type: Number, default: 100, min: 0 },
    sold:        { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    ratingAvg:   { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
