// src/utils/verifyToken.ts

import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Kiểu dữ liệu trả về sau khi verify
export interface UnifiedUser {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  provider: "EMAIL" | "GOOGLE";
}

export async function verifyToken(token: string): Promise<UnifiedUser> {
  // 1. JWT nội bộ
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (decoded && typeof decoded === "object" && decoded.id && decoded.email) {
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: "EMAIL",
      };
    }
  } catch {
    // Không phải JWT nội bộ thì thử Google
  }

  // 2. Google ID Token
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (payload?.email) {
      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) throw new Error("User not found");

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar ?? payload.picture,
        provider: "GOOGLE",
      };
    }
  } catch (err) {
    throw new Error("Invalid or unsupported token");
  }

  throw new Error("Invalid or unsupported token");
}
