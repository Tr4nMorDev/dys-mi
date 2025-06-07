// src/socket/matchmaking.socket.ts
import { Server, Socket } from "socket.io";
import { handleMatchmaking } from "../services/matchmaking.service";
import { ClientToServerEvents, SeverToClientEvents } from "../types/express";
import { MatchData } from "../types/express";
import redis from "../lib/redis";

const userSocketMap = new Map<
  number,
  Socket<SeverToClientEvents, ClientToServerEvents>
>(); // userId -> socket
const waitingQueue: number[] = []; // Dùng để lưu trữ lưu lượng người chơi . ( có thể thay thế bằng redis )
const waitingPerson = "queue-two-persion";
// socket.emit("event", data) Gửi đến client hiện tại vào hàm
// socket.emit(..) Gửi sự kiện đến server
// socket.on() Nghe dữ liệu từ client
// io.emit("event" , data) Gửi đến tất cả các client đang kết nốis
// io.to(id).emit() Gưi riêng dữ liệu đến clientclient
export function matchmakingSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("============================================================");
    console.log("Client connected:", socket.id);
    console.log("User Socket Map:", userSocketMap);
    socket.on("start_matching", async (userId: number) => {
      userSocketMap.set(userId, socket);
      if (waitingQueue.length > 0) {
        const opponentId = waitingQueue.shift()!;
        const opponentSocket = userSocketMap.get(opponentId);

        const matchData: MatchData = {
          id: Date.now(), // hoặc lấy từ DB nếu cần
          player1Id: opponentId,
          player2Id: userId,
          status: "matched", // enum MatchStatus
        };

        if (opponentSocket) opponentSocket.emit("matched", matchData);
        socket.emit("matched", matchData);

        console.log("✅ Matched:", opponentId, "<->", userId);
      } else {
        // Nếu chưa ai chờ, đẩy vào hàng đợi
        waitingQueue.push(userId);
        socket.emit("waiting");

        // Option: timeout sau 15 giây
        setTimeout(() => {
          const index = waitingQueue.indexOf(userId);
          if (index !== -1) {
            waitingQueue.splice(index, 1);
            socket.emit("timeout");
          }
        }, 15000);
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
