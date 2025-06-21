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
import { checkGameResultFromBoard } from "../services/game.service";
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

        const initialBoard = Array(400).fill(null); // 20x20 board
        await redis.set(
          `match:${match.id}:state`,
          JSON.stringify({
            board: initialBoard,
            symbol: "X",
            playerXId: match.playerXId,
            playerOId: match.playerOId,
          })
        );

        // Lưu ánh xạ user → match để xử lý disconnect
        await redis.set(`user:${userId}:matchId`, match.id.toString());
        await redis.set(`user:${opponentId}:matchId`, match.id.toString());

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
      const matchIdStr = await redis.get(`user:${userId}:matchId`);
      if (!matchIdStr) {
        socket.emit("error", "Không tìm thấy matchId của bạn");
        return;
      }
      const matchStateStr = await redis.get(`match:${matchId}:state`);
      if (!matchStateStr) {
        socket.emit("error", "Không tìm thấy trạng thái trận đấu");
        return;
      }

      const matchState = JSON.parse(matchStateStr) as {
        board: (null | "X" | "O")[];
        turn: "X" | "O";
        playerXId: number;
        playerOId: number;
      };
      // Xác thực lượt đi
      const expectedSymbol = matchState.turn;
      const isUserX = userId === matchState.playerXId;
      const isUserO = userId === matchState.playerOId;

      if (
        (expectedSymbol === "X" && !isUserX) ||
        (expectedSymbol === "O" && !isUserO)
      ) {
        socket.emit("error", "Không đúng lượt của bạn");
        return;
      }

      // Tìm opponentId để gửi socket về
      const opponentId = isUserX ? matchState.playerOId : matchState.playerXId;
      try {
        const { board, turn, playerXId, playerOId } = matchState;
        const { isWin, isDraw, nextTurn, winnerId } =
          await checkGameResultFromBoard(
            board,
            index,
            symbol,
            userId,
            playerXId,
            playerOId
          );

        if (!isWin && !isDraw) {
          matchState.board[index] = symbol;
          matchState.turn = nextTurn as "X" | "O";
          await redis.set(`match:${matchId}:state`, JSON.stringify(matchState));
        }

        const opponentSocketId = await redis.get(`socket:${opponentId}`);
        const payload = { index, symbol, nextTurn, isWin, winnerId };

        socket.emit("moveMade", payload);
        if (opponentSocketId) {
          io.to(opponentSocketId).emit("moveMade", payload);
        }

        if (isWin || isDraw) {
          console.log("Game kết thúc, thông báo cho cả hai người chơi");

          const gameEndPayload = {
            winnerId,
            isDraw,
            reason: isDraw ? "draw" : "win",
          };

          socket.emit("gameEnd", gameEndPayload);
          if (opponentSocketId) {
            io.to(opponentSocketId).emit("gameEnd", gameEndPayload);
          }
          await redis.del(`match:${matchId}:state`);
          await redis.del(`user:${userId}:matchId`);
          await redis.del(`user:${opponentId}:matchId`);
        }
      } catch (err: any) {
        console.error("❌ Lỗi:", err.message);
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
function emitWithAck(socket, event, data, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    let acknowledged = false;

    const timeout = setTimeout(() => {
      if (!acknowledged) resolve(false); // timeout
    }, timeoutMs);

    socket.emit(event, data, (ack: boolean) => {
      acknowledged = true;
      clearTimeout(timeout);
      resolve(ack);
    });
  });
}
