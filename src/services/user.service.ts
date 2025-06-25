import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "../generated/prisma/client";
import { AuthProvider } from "../enums/auth-provider.enum";
import UserModel from "../models/user.model";
import dotenv from "dotenv";

dotenv.config(); // đảm bảo biến môi trường được load từ .env

const imagedefault = process.env.SERVER || "http://localhost:3000/1.png";
console.log(imagedefault);
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  provider?: AuthProvider;
}
export const registerUser = async ({
  name,
  email,
  password,
  avatar = imagedefault,
  provider = AuthProvider.EMAIL,
}: RegisterInput): Promise<User> => {
  // Kiểm tra xem email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  let hashedPassword: string | null = null;

  if (provider === AuthProvider.EMAIL) {
    if (!password) {
      throw new Error("MISSING_PASSWORD");
    }
    hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  }

  // Tạo user mới
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatar,
      provider,
    },
  });

  return newUser;
};

interface OAuthUserInput {
  email: string;
  name: string;
  avatar?: string;
  provider: AuthProvider; // GOOGLE hoặc GITHUB
}

export const findOrCreateGoogleUser = async ({
  email,
  name,
  avatar,
  provider,
}: OAuthUserInput): Promise<User> => {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: null,
        avatar,
        provider: AuthProvider.GOOGLE,
      },
    });
  }

  return user;
};

export default {
  registerUser,
  findOrCreateGoogleUser,
};
