import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name?: string;
    picture?: string;
    provider: "EMAIL" | "GOOGLE" | "GITHUB";
  };
}
export interface ClientToServerEvents {
  start_matching: (userId: number) => void;
  cancel_matching: (userId: number) => void;
}
export interface ServertoClientEvents {
  matched: (match: MatchData) => void;
  waiting: () => void;
  timeout: () => void;
}
export interface MatchData {
  id: number;
  player1Id: number;
  player2Id: number;
  status: "matched" | "waiting" | "timeout";
}
