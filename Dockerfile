# Bước 1: Base image (Node 18)
FROM node:18

# Bước 2: Thư mục làm việc
WORKDIR /app

# Bước 3: Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Bước 4: Cài dependencies
RUN npm install

# Bước 5: Copy toàn bộ code vào container
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json .

# Bước 6: Cài Prisma CLI và generate client
RUN npx prisma generate

# Bước 7: Build TypeScript sang JavaScript
RUN npm run build

# Bước 8: Expose port app chạy
EXPOSE 3000

# Bước 9: Chạy file js build ra (thường là trong thư mục dist)
CMD ["node", "dist/server.js"]
