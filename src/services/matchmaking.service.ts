// src/services/matchmaking.service.ts

import redis from "../config/redis";
import { PrismaClient } from "../generated/prisma/client";
import MatchModel from "../models/match.model";
import { Match } from "../generated/prisma/client";
import { Server } from "socket.io";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";

export async function tryFindOpponent(userId: number): Promise<number | null> {
  const queue = await redis.lRange(MATCH_QUEUE_KEY, 0, -1);
  for (const opponent of queue) {
    const id = parseInt(opponent);
    if (id !== userId) {
      await redis.lRem(MATCH_QUEUE_KEY, 0, opponent);
      return id;
    }
  }
  return null;
} // Hàm setup không cho queue là chính user đó

export async function createMatch(player1Id: number, player2Id: number) {
  const match = await prisma.match.create({
    data: {
      player1Id,
      player2Id,
      status: "matched",
      matchedAt: new Date(),
    },
  });

  const isPlayer1X = Math.random() < 0.5;

  const xPlayerId = isPlayer1X ? player1Id : player2Id;
  const oPlayerId = isPlayer1X ? player2Id : player1Id;
  const [xPlayer, oPlayer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: xPlayerId },
      select: { id: true, name: true, avatar: true },
    }), 
    prisma.user.findUnique({
      where: { id: oPlayerId },
      select: { id: true, name: true, avatar: true },
    }),
  ]);
  const boardSize = 20;
  const emptyBoard = Array(boardSize * boardSize).fill(null);

  const game = await prisma.game.create({
    data: {
      matchId: match.id,
      xPlayerId,
      oPlayerId,
      boardState: emptyBoard,
    },
  });

  return {
    id: match.id,
    player1Id,
    player2Id,
    status: match.status,
    playerXId: xPlayerId,
    playerOId: oPlayerId,
    players: {
      X: xPlayer,
      O: oPlayer,
    },
    gameId: game.id,
  };
} // table cập nhật toàn bộ sau khi matched

export async function enqueueUser(userId: number) {
  await redis.rPush(MATCH_QUEUE_KEY, userId.toString());
} // hàm push vào queue ( lí do không trả Promise vì cái này chỉ là tiến trình đợi chưa càn có kết quả )
// không thể không sử dụng await vì lí do sẽ gặp bug ngầm race condition (Lock process)
export async function isStillWaiting(userId: number): Promise<boolean> {
  const queue = await redis.lRange(MATCH_QUEUE_KEY, 0, -1);
  return queue.includes(userId.toString());
} // Hàm check xem và lấy ra chuỗi userId trong queue hiện tại

export async function removeUserFromQueue(userId: number) {
  await redis.lRem(MATCH_QUEUE_KEY, 0, userId.toString());
} // xóa 1 user


