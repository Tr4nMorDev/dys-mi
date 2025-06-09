// src/services/matchmaking.service.ts

import redis from "../lib/redis";
import { PrismaClient } from "../generated/prisma/client";
import MatchModel from "../models/match.model";
import { Match } from "../generated/prisma/client";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";
import { MatchData } from "../types/express";

// export async function handleMatchmaking(userId: number) {
//   const opponentId = await tryFindOpponent(userId);
//   console.log("opponentId : ", opponentId);
//   if (opponentId) {
//     const match = await createMatch(userId, opponentId);
//   }
// }

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
  await prisma.game.create({
    data: {
      matchId: match.id,
      xPlayerId,
      oPlayerId,
      boardState: {}, // hoặc [] tùy theo bạn lưu kiểu gì
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
  };
}

export async function enqueueUser(userId: number) {
  await redis.rPush(MATCH_QUEUE_KEY, userId.toString());
} // hàm push vào queue
export async function isStillWaiting(userId: number): Promise<boolean> {
  const queue = await redis.lRange(MATCH_QUEUE_KEY, 0, -1);
  return queue.includes(userId.toString());
}

export async function removeUserFromQueue(userId: number) {
  await redis.lRem(MATCH_QUEUE_KEY, 0, userId.toString());
}

// Tìm trận đang active theo userId (nếu bạn có lưu Match vào Redis hoặc DB)
export async function getActiveMatch(
  userId: number
): Promise<MatchData | null> {
  const matchRaw = await redis.get(`active_match:${userId}`);
  if (matchRaw) return JSON.parse(matchRaw);
  return null;
}

// Khi tạo match, lưu cho cả hai người để tra ngược được
export async function storeActiveMatch(match: MatchData) {
  await redis.set(`active_match:${match.playerXId}`, JSON.stringify(match));
  await redis.set(`active_match:${match.playerOId}`, JSON.stringify(match));
}

// Xoá match khỏi Redis
export async function removeActiveMatch(userId1: number, userId2: number) {
  await redis.del(`active_match:${userId1}`);
  await redis.del(`active_match:${userId2}`);
}
