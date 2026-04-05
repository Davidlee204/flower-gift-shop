const User     = require('../models/User');
const AppError = require('../utils/AppError');

// ═══════════════════════════════════════════════════════════════════════════════
// FGS-44 — Hồ sơ cá nhân
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/users/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    // Không cho phép đổi password hoặc role qua route này
    const { password, role, isActive, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName: updateData.fullName, phone: updateData.phone, avatar: updateData.avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FGS-45 — Quản lý địa chỉ
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/users/me/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/me/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.addresses.length >= 5)
      return next(new AppError('Tối đa 5 địa chỉ', 400));

    const { label, fullName, phone, street, district, city, isDefault } = req.body;

    // Nếu set làm mặc định → bỏ mặc định tất cả địa chỉ cũ
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    // Địa chỉ đầu tiên luôn là mặc định
    const shouldDefault = isDefault || user.addresses.length === 0;
    user.addresses.push({ label, fullName, phone, street, district, city, isDefault: shouldDefault });

    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const user    = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) return next(new AppError('Không tìm thấy địa chỉ', 404));

    const { label, fullName, phone, street, district, city, isDefault } = req.body;

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    address.label     = label     ?? address.label;
    address.fullName  = fullName  ?? address.fullName;
    address.phone     = phone     ?? address.phone;
    address.street    = street    ?? address.street;
    address.district  = district  ?? address.district;
    address.city      = city      ?? address.city;
    address.isDefault = isDefault ?? address.isDefault;

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/me/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user    = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) return next(new AppError('Không tìm thấy địa chỉ', 404));

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);

    // Nếu xoá địa chỉ mặc định → tự động set địa chỉ đầu tiên còn lại làm mặc định
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};
