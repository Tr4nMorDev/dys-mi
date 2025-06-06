// src/socket/matchmaking.socket.ts
import { Server, Socket } from "socket.io";
import { handleMatchmaking } from "../services/matchmaking.service";
const userSocketMap = new Map<number, Socket>(); // userId -> socket

export function matchmakingSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);
    console.log("User Socket Map:", userSocketMap);
    socket.on("start_matching", async (userId: number) => {
      userSocketMap.set(userId, socket);
      const result = await handleMatchmaking(userId);
      if (result.status === "matched") {
        const { player1Id, player2Id } = result.match;

        const socket1 = userSocketMap.get(player1Id);
        const socket2 = userSocketMap.get(player2Id);

        // Gửi dữ liệu match cho cả 2
        if (socket1) socket1.emit("matched", result.match);
        if (socket2) socket2.emit("matched", result.match);

        console.log(`🔁 Matched: ${player1Id} vs ${player2Id}`);
      } else if (result.status === "waiting") {
        socket.emit("waiting");
      } else if (result.status === "timeout") {
        socket.emit("timeout");
      }
    });
    socket.on("disconnect", () => {
      // cleanup khi disconnect
      for (const [userId, s] of userSocketMap.entries()) {
        if (s === socket) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
}
