import { Request, Response } from "express";
import userService from "../services/user.service";
import authService from "../services/auth.service";
import jwt from "jsonwebtoken";
import { AuthProvider } from "../enums/auth-provider.enum";
import { GoogleRequest } from "../types/express";
// Định nghĩa interface cho request nếu có thêm custom field


const googleLogin = async (req: Request, res: Response) => {
  const { googleUser } = req as GoogleRequest;
  const { email, name, picture } = googleUser;


  try {
    const user = await userService.findOrCreateGoogleUser({
      email,
      name,
      avatar: picture, // truyền đúng trường avatar
      provider: AuthProvider.GOOGLE, // nhớ thêm nếu cần
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ user, token });
  } catch (err: any) {
    console.error("Google login error:", err.message);
    res.status(500).json({ message: "Lỗi đăng nhập", error: err.message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await authService.login(email, password);
    res.json({ user, token });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await authService.logout((req as GoogleRequest).user!.id);
    res.json({ user });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export default {
  login,
  googleLogin,
  logout,
};
