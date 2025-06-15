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
import { checkGameResult } from "../services/game.service";
import redis from "../lib/redis";
import { match } from "node:assert";

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
        // lưu trạng thái match cho cả hai người chơi
        await redis.set(
          `user:${userId}:matchState`,
          JSON.stringify({
            matchId: match.id,
            symbol: userId === match.playerXId ? "X" : "O",
            opponentId: opponentId,
          })
        );

        await redis.set(
          `user:${opponentId}:matchState`,
          JSON.stringify({
            matchId: match.id,
            symbol: opponentId === match.playerXId ? "X" : "O",
            opponentId: userId,
          })
        );
        // xóa ra khỏi một queue báo hiệu 2 người này đã match
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

    socket.on("makeMove", async ({ matchId, index, symbol }) => {
      //xác thực
      const userId = socket.data.user.id;
      console.log(
        `🎮 User ${userId} attempting move in match ${matchId} at index ${index} with symbol ${symbol}`
      );
      const matchStateStr = await redis.get(`user:${userId}:matchState`);
      if (!matchStateStr) {
        socket.emit("error", "Không tìm thấy trạng thái trận đấu");
        return;
      }
      const matchState = JSON.parse(matchStateStr) as {
        matchId: number;
        symbol: "X" | "O";
        opponentId: number;
      };
      if (matchState.matchId !== matchId) {
        socket.emit("error", "Bạn không thuộc trận này");
        return;
      }

      if (matchState.symbol !== symbol) {
        socket.emit("error", "Không đúng lượt của bạn");
        return;
      }
      try {
        const { isWin, isDraw, updatedGame, nextTurn } = await checkGameResult(
          game,
          index,
          symbol,
          userId
        );
        const opponentSocketId = await redis.get(
          `socket:${matchState.opponentId}`
        ); // Lấy socket ID của đối thủ

        const payload = { index, symbol };
        socket.emit("moveMake", payload);
        if (opponentSocketId) {
          io.to(opponentSocketId).emit("move", payload);
        }
        if (isWin || isDraw) {
          await redis.del(`user:${userId}:matchState`);
          await redis.del(`user:${matchState.opponentId}:matchState`);
        }
      } catch (err: any) {
        socket.emit("error", err.message);
      }
    });

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
