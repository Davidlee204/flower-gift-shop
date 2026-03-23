require('dotenv').config();
const http      = require('http');
const app       = require('./app');
const connectDB = require('./config/db');
// Bỏ comment khi tạo file socket.js xong:
// const initSocket = require('./src/realtime/socket');

const PORT = process.env.PORT || 5000;

// Kết nối MongoDB
connectDB();

// Tạo HTTP server
const server = http.createServer(app);

// Bỏ comment khi tạo file socket.js xong:
// initSocket(server);

// Lắng nghe
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Môi trường: ${process.env.NODE_ENV}`);
});

// Xử lý lỗi không bắt được
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});