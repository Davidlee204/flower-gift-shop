# 🌸 Flower Gift Shop

> Website đặt điện hoa và quà tặng trực tuyến

---

## 👥 Thành viên nhóm

| Họ và tên | MSSV |
|-----------|------|
| Lê Văn Quý | 2280602659 | 
| Nguyễn Tài Đức | 2280600733 | 

---

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | React.js 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Realtime | Socket.io |
| Xác thực | JWT (Access Token + Refresh Token) |
| Upload ảnh | Cloudinary |
| Gửi email | Nodemailer |

---

## 📁 Cấu trúc dự án

```
flower-gift-shop/
├── backend/
│   ├── src/
│   │   ├── config/         # Cấu hình DB, Cloudinary, Seed data
│   │   ├── controllers/    # Xử lý logic request
│   │   ├── middlewares/    # Auth, Error handler
│   │   ├── models/         # Schema MongoDB (User, Product, Order...)
│   │   ├── routers/        # Định tuyến API
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Hàm tiện ích, AppError
│   │   ├── validators/     # Validate input
│   │   ├── realtime/       # Socket.io
│   │   ├── events/         # Event emitters
│   │   └── workers/        # Background jobs
│   ├── app.js
│   ├── server.js
│   ├── .env.example        # Mẫu biến môi trường
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # Hình ảnh, icon tĩnh
│   │   ├── components/     # UI components tái sử dụng
│   │   ├── contexts/       # React Context (Auth, Cart)
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout chung (MainLayout)
│   │   ├── pages/          # Các trang (auth, user, admin...)
│   │   └── services/       # Gọi API (axiosConfig)
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9

---

### Bước 1 — Clone dự án

```bash
git clone https://github.com/le-van-quy-2659/flower-gift-shop.git
cd flower-gift-shop
git checkout develop
```

---

### Bước 2 — Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```


Chạy backend:

```bash
npm run dev
```

✅ Backend: `http://localhost:5000`  
✅ Health check: `http://localhost:5000/api/health`

---

### Bước 3 — Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Nội dung `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=Flower Gift Shop
```

Chạy frontend:

```bash
npm run dev
```

✅ Frontend: `http://localhost:5173`

---

### Bước 4 — Tạo dữ liệu mẫu (Seed)

```bash
cd backend
npm run seed
```

Sau khi chạy xong database sẽ có:

```
flower_gift_shop/
├── users       5 tài khoản
├── categories  8 danh mục hoa
├── products    22 sản phẩm có ảnh thật
└── coupons     5 mã giảm giá
```

Tài khoản test:

| Email | Mật khẩu | Quyền |
|-------|----------|-------|
| admin@flowershop.com | 123456 | Admin |
| leejackquy@gmail.com | 123456 | User |
| duc@flowershop.com | 123456 | User |

---

### Mỗi khi làm tính năng mới:

```bash
# 1. Cập nhật develop mới nhất
git checkout develop
git pull origin develop

# 2. Tạo nhánh tính năng
git checkout -b feature/ten-tinh-nang

# 3. Làm xong → commit
git add .
git commit -m "feat: mô tả tính năng"

# 4. Push lên remote
git push origin feature/ten-tinh-nang

# 5. Tạo Pull Request trên GitHub: feature → develop
```

---

## 📝 Quy tắc đặt tên commit

| Prefix | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| `feat:` | Thêm tính năng mới | `feat: thêm đăng ký người dùng` |
| `fix:` | Sửa lỗi | `fix: sửa lỗi không thêm được vào giỏ hàng` |
| `docs:` | Cập nhật tài liệu | `docs: cập nhật README` |
| `style:` | Chỉnh CSS/UI | `style: căn chỉnh layout trang chủ` |
| `refactor:` | Tái cấu trúc code | `refactor: tách service xử lý đơn hàng` |
| `chore:` | Cập nhật config | `chore: thêm script seed vào package.json` |

---

## ⚠️ Lưu ý quan trọng

- File `.env` **tuyệt đối không push** lên GitHub
- Chỉ push `.env.example` để thành viên biết cần điền gì
- Mọi tính năng mới đều làm trên nhánh `feature/` riêng
- Không commit thẳng lên `develop` hoặc `main`
- Phải tạo **Pull Request** để merge vào `develop`
