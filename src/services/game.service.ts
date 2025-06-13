import redis from "../lib/redis";
import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();
import { checkWinner } from "../utils/gameLogic";

export async function makeMove(
  gameId: number,
  index: number,
  playerId: number
) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });

  // Update boardState và kiểm tra kết quả
  const board = game.boardState; // array 2D
  board[row][col] = playerId === game.xPlayerId ? "X" : "O";

  const winner = checkWinner(board);

  if (winner) {
    await prisma.game.update({
      where: { id: gameId },
      data: {
        boardState: board,
        finishedAt: new Date(),
        winnerId: winner === "X" ? game.xPlayerId : game.oPlayerId,
      },
    });
  } else {
    await prisma.game.update({
      where: { id: gameId },
      data: { boardState: board },
    });
  }
}
