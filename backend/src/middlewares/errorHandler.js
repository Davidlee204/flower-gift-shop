const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = Object.create(err);
  error.message    = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose: ID sai định dạng
  if (err.name === 'CastError')
    error = new AppError(`Không tìm thấy với id: ${err.value}`, 404);

  // Mongoose: Trùng unique field (email đã tồn tại)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(`"${value}" đã được sử dụng, vui lòng chọn giá trị khác`, 400);
  }

  // Mongoose: Validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')
    error = new AppError('Token không hợp lệ', 401);
  if (err.name === 'TokenExpiredError')
    error = new AppError('Token đã hết hạn, vui lòng đăng nhập lại', 401);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
