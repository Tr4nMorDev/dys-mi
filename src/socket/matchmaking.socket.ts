// src/socket/matchmaking.socket.ts
import { Server, Socket } from "socket.io";
import {
  tryFindOpponent,
  createMatch,
  isStillWaiting,
  removeUserFromQueue,
  enqueueUser,
  handleMatchedUserDisconnect,
  handleWaitingUserDisconnect,
} from "../services/matchmaking.service";
import {
  ClientToServerEvents,
  SeverToClientEvents,
  MatchData,
} from "../types/express";
import redis from "../lib/redis";

const userSocketMap = new Map<
  number,
  Socket<SeverToClientEvents, ClientToServerEvents>
>();

// Hàm chính
export function matchmakingSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 New connection: ${socket.id}`);

    socket.on("waiting", async () => {
      const userId = socket.data.user.id;
      userSocketMap.set(userId, socket);
      await redis.set(`socket:${userId}`, socket.id);
      await enqueueUser(userId);

      const opponentId = await tryFindOpponent(userId);

      if (opponentId) {
        const match = await createMatch(userId, opponentId);
        const opponentSocketId = await redis.get(`socket:${opponentId}`);

        await removeUserFromQueue(userId);
        await removeUserFromQueue(opponentId);

        // Emit matched event tới cả hai người
        socket.emit("matched", {
          ...match,
          youAre: match.playerXId === userId ? "X" : "O",
        });

        if (opponentSocketId) {
          io.to(opponentSocketId).emit("matched", {
            ...match,
            youAre: match.playerXId === opponentId ? "X" : "O",
          });
        }
      } else {
        // Sau 5s, nếu chưa match thì timeout
        setTimeout(async () => {
          const stillWaiting = await isStillWaiting(userId);
          if (stillWaiting) {
            await removeUserFromQueue(userId);
            socket.emit("timeout");
          }
        }, 5000);
      }
    });
    socket.on("makeMove", async ({ matchId, index, symbol }) => {});
    socket.on("disconnect", async () => {
      console.log(`❌ Disconnected: ${socket.id}`);

      for (const [userId, s] of userSocketMap.entries()) {
        if (s.id === socket.id) {
          userSocketMap.delete(userId);

          const matchId = await redis.get(`user:${userId}:matchId`);
          if (matchId) {
            await handleMatchedUserDisconnect(userId, matchId, io);
          } else {
            await handleWaitingUserDisconnect(userId);
          }

          await redis.del(`socket:${userId}`);
          break;
        }
      }
    });
  });
}
