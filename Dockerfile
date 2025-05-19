# Base image
FROM node:18

# Tạo thư mục app
WORKDIR /app

# Copy file cần thiết
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Mặc định chạy app (nếu không dùng command ở docker-compose)
CMD ["node", "src/server.js"]
