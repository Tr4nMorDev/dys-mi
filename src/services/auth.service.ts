import { PrismaClient, User, AuthProvider } from "../generated/prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    avatar: string | null;
    provider: AuthProvider;
  };
}
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw { status: 401, message: "Email không tồn tại" };
  }

  if (!user.password) {
    throw {
      status: 401,
      message:
        "Tài khoản này không sử dụng mật khẩu, vui lòng đăng nhập bằng phương thức OAuth",
    };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Sai mật khẩu" };
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
    },
  };
};
export const logout = async (userId: number): Promise<User> => {
  // Giả sử logout bạn làm gì đó như xoá token, cập nhật trạng thái user...

  // Ví dụ lấy lại user sau khi logout để trả về
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw { status: 404, message: "User không tồn tại" };
  }

  // Giả sử cập nhật trạng thái logout ở đây (nếu có)

  return user; // Trả về user đúng kiểu User
};

export default {
  login,
  logout,
};
