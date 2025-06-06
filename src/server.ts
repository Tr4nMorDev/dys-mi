import http from "http";
import { Server } from "socket.io";
import app from "./app";
import dotenv from "dotenv";
import { matchmakingSocket } from "./socket/matchmaking.socket";
import pool from "./config/db";
import { connectRedis } from "./lib/redis";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");

    app.locals.db = pool;
    connectRedis();

    // Tạo server HTTP từ express app
    const server = http.createServer(app);

    // Tạo socket.io server, gắn vào server HTTP
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:5137", // frontend URL
        methods: ["GET", "POST"],
      },
    });

    // Gắn socket handlers
    matchmakingSocket(io);

    // Lắng nghe
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  }
}

startServer();
