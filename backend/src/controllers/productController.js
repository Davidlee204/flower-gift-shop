// Sprint 2 — Product API
// Tasks: Tạo API sản phẩm CRUD, tìm kiếm, lọc & sắp xếp, SP gợi ý liên quan
const Product  = require('../models/Product');
const AppError = require('../utils/AppError');

// ── Helpers ───────────────────────────────────────────────────────────────────
const buildFilter = (query) => {
  const filter = { isActive: true };
  if (query.category)                filter.category   = query.category;
  if (query.occasion)                filter.occasion   = { $in: query.occasion.split(',') };
  if (query.tags)                    filter.tags       = { $in: query.tags.split(',') };
  if (query.isFeatured === 'true')   filter.isFeatured = true;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  return filter;
};

const buildSort = (sortBy) => {
  const map = {
    newest:      { createdAt: -1 },
    price_asc:   { price: 1 },
    price_desc:  { price: -1 },
    rating:      { ratingAvg: -1 },
    best_seller: { sold: -1 },
  };
  return map[sortBy] || { createdAt: -1 };
};

// ── GET /api/products ─────────────────────────────────────────────────────────
// Query: category, occasion, tags, minPrice, maxPrice, sortBy, page, limit, isFeatured
exports.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;
    const filter = buildFilter(req.query);
    const sort   = buildSort(req.query.sortBy);

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages:    Math.ceil(total / limit),
      products,
    });
  } catch (err) { next(err); }
};

// ── GET /api/products/search?q=... ────────────────────────────────────────────
exports.search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q?.trim()) return next(new AppError('Vui lòng nhập từ khoá tìm kiếm', 400));

    const skip = (Number(page) - 1) * Number(limit);
    const filter = {
      isActive: true,
      $text: { $search: q.trim() },
    };

    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: 'textScore' } })
        .populate('category', 'name slug')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), products });
  } catch (err) { next(err); }
};

// ── GET /api/products/featured ───────────────────────────────────────────────
exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(8);
    res.json({ success: true, products });
  } catch (err) { next(err); }
};

// ── GET /api/products/:id ─────────────────────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.isActive)
      return next(new AppError('Không tìm thấy sản phẩm', 404));
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// ── GET /api/products/:id/related ─────────────────────────────────────────────
exports.getRelated = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Không tìm thấy sản phẩm', 404));

    const related = await Product.find({
      _id:      { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(6);

    res.json({ success: true, products: related });
  } catch (err) { next(err); }
};

// ── POST /api/products (admin) ────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

// ── PUT /api/products/:id (admin) ─────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) return next(new AppError('Không tìm thấy sản phẩm', 404));
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// ── DELETE /api/products/:id (admin) — soft delete ───────────────────────────
exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!product) return next(new AppError('Không tìm thấy sản phẩm', 404));
    res.json({ success: true, message: 'Đã ẩn sản phẩm' });
  } catch (err) { next(err); }
};
