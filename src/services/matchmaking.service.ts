// src/services/matchmaking.service.ts

import redis from "../lib/redis";
import { PrismaClient } from "../generated/prisma/client";
import MatchModel from "../models/match.model";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";

export async function handleMatchmaking(userId: number) {
  console.log("============================================================");
  const currentQueue = (await redis.lRange(MATCH_QUEUE_KEY, 0, -1)) as string[];
  for (const opponentStr of currentQueue) {
    console.log("currentQueue : ", currentQueue);
    console.log("opponenStr : ", opponentStr);
    const opponentId = parseInt(opponentStr);
    if (opponentId !== userId) {
      await redis.lRem(MATCH_QUEUE_KEY, 0, opponentStr);
      //   const match = await prisma.match.create({
      //     data: {
      //       playerXId: opponentId,
      //       playerOId: userId,
      //       status: "matched",
      //     },
      //   });
      const match = await MatchModel.create({
        player1Id: opponentId,
        player2Id: userId,
        status: "matched",
        matchedAt: new Date(),
      });
      return { status: "matched", matchId: match };
    }
  }
  await redis.rPush(MATCH_QUEUE_KEY, userId.toString());
  return { status: "waiting" };
}
// const waitingMatch = await prisma.match.findFirst({
//   where: {
//     AND: [
//       { userIdA: userId },
//       { userIdB: currentQueue[0] },
//       { status: "waiting" },
//     ],
//   },
// });
// console.log("waitingMatch : ", waitingMatch);
// if (waitingMatch) {
//   const now = new Date();
//   const elapsedSeconds =
// if (waitingMatch) {
//   const now = new Date();
//   const elapsedSeconds =
//     (now.getTime() - new Date(waitingMatch.createdAt).getTime()) / 1000;
//   console.log("elapsedSeconds : ", elapsedSeconds);
//   if (elapsedSeconds >= 30) {
//     await prisma.match.update({
//       where: { id: waitingMatch.id },
//       data: { status: "timeout" },
//     });
//     await redis.lRem(MATCH_QUEUE_KEY, 0, userId.toString());
//     return { status: "timeout" };
//   }
//     }

//     return { status: "waiting" };
// //   }
//   if (currentQueue.length === 1) {
//   }
//   const opponentIdRaw = await redis.lPop(MATCH_QUEUE_KEY);
//   const opponentId = opponentIdRaw ? parseInt(opponentIdRaw) : null;

//   if (!opponentId || opponentId === userId) {
//     await redis.lPush(MATCH_QUEUE_KEY, userId.toString());
//     return { status: "waiting" };
//   }

//   const match = await MatchModel.create({
//     player1Id: opponentId,
//     player2Id: userId,
//     status: "matched",
//     matchedAt: new Date(),
//   });

//   return { status: "matched", match };
// }
