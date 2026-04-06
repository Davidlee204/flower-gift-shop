const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes Sprint 1 ───────────────────────────────────────────────────────────
const authRoutes              = require('./routers/authRoutes');
const { userRouter }          = require('./routers/authRoutes');

app.use('/api/auth',  authRoutes);
app.use('/api/users', userRouter);

// Sprint 2 → mở API backend cho frontend HomePage
app.use('/api/products',   require('./routers/productRoutes'));
app.use('/api/categories', require('./routers/categoryRoutes'));
app.use('/api/wishlist',   require('./routers/wishlistRoutes'));
app.use('/api/notifications', require('./routers/notificationRoutes'));

// Sprint 3 → uncomment khi làm
app.use('/api/orders',   require('./routers/orderRoutes'));
app.use('/api/payment',       require('./routers/paymentRoutes'));
app.use('/api/coupons',  require('./routers/couponRoutes'));

// Sprint 4 → uncomment khi làm
// app.use('/api/admin', require('./src/routers/adminRoutes'));

// Health check
app.get('/api/health', (_, res) =>
  res.json({ success: true, message: '🌸 Flower Gift System API đang chạy' })
);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Không tìm thấy route: ${req.originalUrl}` })
);

// ── Error Handler — PHẢI đặt CUỐI CÙNG ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
