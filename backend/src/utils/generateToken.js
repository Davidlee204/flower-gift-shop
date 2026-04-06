const jwt = require('jsonwebtoken');

// ── Tạo Access Token (token ngắn hạn để gọi API) ──────────────────────────
// Sử dụng JWT_SECRET từ .env, expire trong 7 ngày
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Tạo Refresh Token (token dài hạn để làm mới Access Token) ──────────────
// Sử dụng JWT_REFRESH_SECRET từ .env, expire trong 30 ngày
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

module.exports = { generateAccessToken, generateRefreshToken };
