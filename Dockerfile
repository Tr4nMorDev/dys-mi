# Base image
FROM node:18

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Copy wait-for-it.sh vào container và cấp quyền thực thi
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

# Generate Prisma client INSIDE container
RUN npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Sửa CMD thành ENTRYPOINT để dùng wait-for-it.sh chờ postgres trước khi chạy app
ENTRYPOINT ["/usr/local/bin/wait-for-it.sh", "postgres-db:5432", "--timeout=60", "--"]

CMD ["node", "dist/server.js"]
