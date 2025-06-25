import { Request } from "express";
import { MatchStatus } from "../generated/prisma";
// User
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name?: string;
    picture?: string;
    provider: "EMAIL" | "GOOGLE" | "GITHUB";
  };
}
