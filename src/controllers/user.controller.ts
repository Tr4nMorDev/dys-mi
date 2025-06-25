import { Request, Response } from "express";
import userService from "../services/user.service";
import { AuthProvider } from "../enums/auth-provider.enum";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { registeredUsers } from "../metrics"; // import metric

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body as RegisterRequestBody;
  console.log(name , email , password)
  const provider = AuthProvider.EMAIL;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Email không hợp lệ" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Mật khẩu quá yếu (>= 6 ký tự)" });
    return;
  }

  try {
    const user = await userService.registerUser({
      name,
      email,
      password,
      provider,
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Tăng metric mỗi khi có user mới
    // registeredUsers.inc();

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (err: any) {
    if (err.message === "EMAIL_EXISTS") {
      res.status(409).json({ message: "Email đã tồn tại" });
      return;
    }

    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export default registerUser;
