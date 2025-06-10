# ----- Giai đoạn 1: Build (Builder) -----
# Sử dụng image Node.js phiên bản 20-alpine (alpine rất nhẹ) làm môi trường build
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json và package-lock.json (hoặc yarn.lock)
# Việc copy riêng 2 file này giúp tận dụng cache của Docker, chỉ cài lại dependencies khi 2 file này thay đổi
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code còn lại vào thư mục /app
COPY . .

# Chạy lệnh build của Vite
RUN npm run build


# ----- Giai đoạn 2: Production (Runner) -----
# Sử dụng image Nginx chính thức, phiên bản stable-alpine (siêu nhẹ)
FROM nginx:stable-alpine

# Copy các file tĩnh đã được build từ giai đoạn 'builder' vào thư mục phục vụ web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx đã tạo ở trên vào trong container
# Ghi đè file cấu hình mặc định của Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 để bên ngoài có thể truy cập vào Nginx
EXPOSE 80

# Lệnh để khởi động Nginx khi container chạy
CMD ["nginx", "-g", "daemon off;"]