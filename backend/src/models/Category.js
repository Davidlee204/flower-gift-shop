const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, 'Vui lòng nhập tên danh mục'], trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    image:     { type: String, default: '' },
    isActive:  { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
