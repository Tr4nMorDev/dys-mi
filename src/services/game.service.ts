import redis from "../lib/redis";
import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();
import { checkWinner } from "../utils/gameLogic";
import { Game } from "../generated/prisma/client";

export async function checkGameResult(
  game: Game,
  index: number,
  symbol: "X" | "O",
  userId: number
) {
  const board = game.boardState as ("X" | "O" | null)[];
  if (board[index]) {
    throw new Error("Ô đã được đánh");
  }

  board[index] = symbol;

  const isWin = checkWinner(board, index, symbol);
  const isDraw = !board.includes(null);
  const nextTurn = symbol === "X" ? "O" : "X";

  const updatedGame = await prisma.game.update({
    where: { id: game.id },
    data: {
      boardState: board,
      winnerId: isWin ? userId : undefined,
      finishedAt: isWin || isDraw ? new Date() : undefined,
    },
  });

  return {
    board,
    isWin,
    isDraw,
    nextTurn,
    updatedGame,
  };
}
export async function getGame(gameId: number): Promise<Game | null> {
  return await prisma.game.findUnique({ where: { id: gameId } });
}
export async function processMove(
  userId: number,
  matchId: number,
  index: number
) {}
