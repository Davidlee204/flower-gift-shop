// Sprint 2 — Wishlist API
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');

// GET /api/wishlist — Lấy danh sách chi tiết để hiển thị hình ảnh
exports.get = async (req, res, next) => {
  try {
    // Luôn populate toàn bộ thông tin từ bảng Product
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products'); 

    res.json({ 
      success: true, 
      products: wishlist?.products || [] 
    });
  } catch (err) { next(err); }
};

// POST /api/wishlist/:productId — Thêm sản phẩm
exports.add = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    } else {
      // Kiểm tra tránh trùng lặp bằng cách chuyển ObjectId về String
      const exists = wishlist.products.some(id => id.toString() === productId);
      
      if (exists) {
        // Nếu có rồi vẫn populate và trả về để đồng bộ giao diện
        await wishlist.populate('products');
        return res.json({ success: true, message: 'Đã có trong wishlist', products: wishlist.products });
      }
      
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Populate đầy đủ thông tin sản phẩm trước khi gửi về Client
    await wishlist.populate('products');
    
    res.json({ 
      success: true, 
      message: 'Đã thêm vào yêu thích', 
      products: wishlist.products 
    });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist/:productId — Xoá khỏi wishlist
exports.remove = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) return res.json({ success: true, products: [] });
    
    // Lọc bỏ sản phẩm
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    
    // Trả về danh sách mới sau khi xóa để Frontend cập nhật ngay
    await wishlist.populate('products');
    
    res.json({ 
      success: true, 
      message: 'Đã xoá khỏi yêu thích', 
      products: wishlist.products 
    });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist — Xoá toàn bộ
exports.clear = async (req, res, next) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    res.json({ success: true, message: 'Đã xoá toàn bộ wishlist', products: [] });
  } catch (err) { next(err); }
};