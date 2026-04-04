const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Sub-schema: Địa chỉ giao hàng ────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    label:     { type: String, default: 'Nhà' },       // Nhà | Công ty | Khác
    fullName:  { type: String, required: [true, 'Vui lòng nhập tên người nhận'] },
    phone:     { type: String, required: [true, 'Vui lòng nhập số điện thoại'] },
    street:    { type: String, required: [true, 'Vui lòng nhập địa chỉ'] },
    district:  { type: String, required: [true, 'Vui lòng nhập quận/huyện'] },
    city:      { type: String, required: [true, 'Vui lòng nhập tỉnh/thành phố'] },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

// ── Main schema: User ─────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
      select: false,         // Không trả password khi query mặc định
    },
    avatar:   { type: String, default: '' },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },

    // Địa chỉ giao hàng (mảng, tối đa 5 địa chỉ)
    addresses: {
      type:     [addressSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message:   'Tối đa 5 địa chỉ',
      },
    },

    // Refresh token (lưu để invalidate khi logout)
    refreshToken: { type: String, select: false },

    // Reset mật khẩu
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,                           // createdAt, updatedAt
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Hash password trước khi lưu ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── So sánh password khi đăng nhập ───────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Đảm bảo chỉ có 1 địa chỉ default ────────────────────────────────────────
userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id.toString() === addressId.toString();
  });
};

module.exports = mongoose.model('User', userSchema);
