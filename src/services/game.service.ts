import redis from "../config/redis";
import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();
import { checkWinner } from "../utils/gameLogic";
import { Game } from "../generated/prisma/client";
export function checkGameResultFromBoard(
  board: ("X" | "O" | null)[],
  index: number,
  symbol: "X" | "O",
  userId: number,
  playerXId: number,
  playerOId: number
) {
  if (board[index]) {
    throw new Error("Ô đã được đánh");
  }

  board[index] = symbol;

  const isWin = checkWinner(board, index, symbol);
  const isDraw = !board.includes(null);
  const nextTurn = symbol === "X" ? "O" : "X";
  const winnerId = isWin ? userId : null;

  return {
    isWin,
    isDraw,
    nextTurn,
    board,
    winnerId,
  };
}
