# 1. Dùng node version 18 hoặc 20
FROM node:20

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json vào trước để install thư viện
COPY package*.json ./
RUN npm install

# 4. Copy toàn bộ code còn lại
COPY . .

# 5. Mở cổng 5000 (giống PORT của ông)
EXPOSE 5000

# 6. Lệnh khởi chạy server
CMD ["node", "server.js"]