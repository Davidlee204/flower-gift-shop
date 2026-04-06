// Sprint 2 — Wishlist API
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');

// GET /api/wishlist
exports.get = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', '_id name slug price salePrice images ratingAvg');
    res.json({ success: true, products: wishlist?.products || [] });
  } catch (err) { next(err); }
};

// POST /api/wishlist/:productId — thêm sản phẩm
exports.add = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      if (wishlist.products.includes(productId))
        return res.json({ success: true, message: 'Đã có trong wishlist', products: wishlist.products });
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products', '_id name slug price salePrice images ratingAvg');
    res.json({ success: true, message: 'Đã thêm vào yêu thích', products: wishlist.products });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist/:productId — xoá khỏi wishlist
exports.remove = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) return res.json({ success: true, products: [] });
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products', '_id name slug price salePrice images ratingAvg');
    res.json({ success: true, message: 'Đã xoá khỏi yêu thích', products: wishlist.products });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist — xoá toàn bộ
exports.clear = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    res.json({ success: true, message: 'Đã xoá toàn bộ wishlist' });
  } catch (err) { next(err); }
};
