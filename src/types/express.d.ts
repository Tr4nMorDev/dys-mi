import { Request } from "express";
import { MatchStatus } from "../generated/prisma";
import { AuthProvider } from "../enums/auth-provider.enum";
// User

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name?: string;
    picture?: string;
    provider: "EMAIL" | "GOOGLE" | "GITHUB";
  };
}
export interface GoogleRequest extends Request {
  googleUser: {
    email: string;
    name: string;
    picture?: string;
    provider: AuthProvider;
  };
  user?: { id: number }; // Cho logout
}