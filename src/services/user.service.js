// @ts-check
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

exports.registerUser = async ({
  name,
  email,
  password,
  picture,
  google = false,
}) => {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  let hashedPassword = null;
  if (!google) {
    // Đăng ký thường: phải có password và ảnh mặc định
    hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    picture = "default.png"; // Tên ảnh mặc định lưu trong thư mục public/images chẳng hạn
  }
  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
  });
  return newUser;
};

exports.findOrCreateGoogleUser = async ({ email, name, picture }) => {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: null,
        avatar: picture,
        google: true,
      },
    });
  }

  return user;
};
