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

//Matching-socket-interact
export interface ClientToServerEvents {
  start_matching: (userId: number) => void;
  cancel_matching: (userId: number) => void;
  matched: (match: MatchData) => void;
  timeout: () => void;
}
export interface SeverToClientEvents {
  matched: (match: MatchData) => void;
  waiting: () => void;
  timeout: () => void;
  connect_error?: (err: string) => void;
}

export type MatchStatus = "waiting" | "matched" | "timeout";
export interface MatchData {
  id: number;
  player1Id: number;
  player2Id?: number;
  status: MatchStatus;
  playerXId: number; // người chơi X
  playerOId: number; // người chơi O
}
