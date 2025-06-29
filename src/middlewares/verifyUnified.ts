import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
// import { prismaVersion } from "../generated/prisma/internal/prismaNamespace";
import { PrismaClient } from "../generated/prisma/client";
// import axios from "axios";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

interface AuthenticatedRequest extends Request {
  user?: any;
}
interface UserPayload {
  email: string;
  name?: string;
  provider: "EMAIL" | "GOOGLE" | "GITHUB";
}

export const verifyUnified = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Vao very")
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
  // 1. JWT tự phát hành
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "object" && decoded !== null) {
      req.user = { ...decoded, provider: "EMAIL" };
      return next();
    }
  } catch {}

  // 2. Google Token
  try {
    console.log("Test kết quả google ")
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (payload?.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!existingUser) {
        res.status(401).json({ message: "User not found in system" });
        return;
      }
      req.user = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        picture: existingUser.avatar ?? payload.picture, // fallback nếu DB chưa có avatar
        provider: "GOOGLE",
      };
      return next();
    }
  } catch{}

  // 3. GitHub Token
  //   try {
  //     const githubResponse = await axios.get("https://api.github.com/user", {
  //       headers: {
  //         Authorization: `token ${token}`,
  //         Accept: "application/vnd.github+json",
  //       },
  //     });

  //     const user = githubResponse.data;

  //     req.user = {
  //       email: user.email || "unknown@github.com",
  //       name: user.name || user.login,
  //       provider: "github",
  //     };

  //     return next();
  //   } catch {}

  // Nếu không xác thực được ở bất kỳ đâu
  res.status(403).json({ message: "Invalid or unsupported token" });
};
