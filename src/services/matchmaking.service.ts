// src/services/matchmaking.service.ts

import redis from "../lib/redis";
import { PrismaClient } from "../generated/prisma/client";
import MatchModel from "../models/match.model";
import { Match } from "../generated/prisma/client";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";

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
export async function createMatch(p1: number, p2: number): Promise<Match> {
  return MatchModel.create({
    player1Id: p1,
    player2Id: p2,
    matchedAt: new Date(),
    status: "matched",
  });
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
