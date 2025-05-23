// src/models/User.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UserModel {
  // Tạo user mới
  async create(data) {
    return await prisma.user.create({ data });
  }

  // Tìm user theo email
  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  // Tìm user theo ID
  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  // Lấy tất cả user
  async findAll() {
    return await prisma.user.findMany();
  }

  // Cập nhật user
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // Xóa user
  async delete(id) {
    return await prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserModel();
