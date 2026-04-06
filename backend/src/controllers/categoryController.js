// Sprint 2 — Category API
const Category = require('../models/Category');
const AppError  = require('../utils/AppError');

// GET /api/categories — lấy tất cả (public)
exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, total: categories.length, categories });
  } catch (err) { next(err); }
};

// GET /api/categories/:id — lấy 1 category (public)
exports.getOne = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new AppError('Không tìm thấy danh mục', 404));
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

// POST /api/categories — tạo mới (admin only)
exports.create = async (req, res, next) => {
  try {
    const { name, slug, image, sortOrder } = req.body;
    if (!name || !slug) return next(new AppError('Tên và slug là bắt buộc', 400));
    const category = await Category.create({ name, slug, image, sortOrder });
    res.status(201).json({ success: true, category });
  } catch (err) { next(err); }
};

// PUT /api/categories/:id — cập nhật (admin only)
exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) return next(new AppError('Không tìm thấy danh mục', 404));
    res.json({ success: true, category });
  } catch (err) { next(err); }
};

// DELETE /api/categories/:id — xoá (admin only)
exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Không tìm thấy danh mục', 404));
    res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (err) { next(err); }
};
