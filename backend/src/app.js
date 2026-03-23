const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// ============================
// Middlewares
// ============================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================
// Routes — bỏ comment khi tạo file xong
// ============================
// app.use('/api/auth',          require('./routers/authRoutes'));
// app.use('/api/users',         require('./routers/userRoutes'));
// app.use('/api/products',      require('./routers/productRoutes'));
// app.use('/api/categories',    require('./routers/categoryRoutes'));
// app.use('/api/orders',        require('./routers/orderRoutes'));
// app.use('/api/cart',          require('./routers/cartRoutes'));
// app.use('/api/reviews',       require('./routers/reviewRoutes'));
// app.use('/api/coupons',       require('./routers/couponRoutes'));
// app.use('/api/wishlist',      require('./routers/wishlistRoutes'));
// app.use('/api/upload',        require('./routers/uploadRoutes'));
// app.use('/api/payment',       require('./routers/paymentRoutes'));
// app.use('/api/notifications', require('./routers/notificationRoutes'));

// Health check — test server hoạt động chưa
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🌸 Flower Gift Shop API đang hoạt động' });
});

// ============================
// Error Handler — bỏ comment khi tạo file xong
// ============================
// app.use(require('./middlewares/errorHandler'));

module.exports = app;