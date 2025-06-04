// src/server.ts

import app from "./app";
import pool from "./config/db";
import { Request, Response } from "express";
import redis from "./lib/redis";
import dotenv from "dotenv";

dotenv.config(); // đảm bảo biến môi trường được load từ .env

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    // Kiểm tra kết nối đến PostgreSQL
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");
    console.log("👉 Redis URL:", process.env.REDIS_URL);
    // Gắn pool vào app.locals để sử dụng trong các middleware, routes, v.v.
    app.locals.db = pool;
    // Kết nối Redis
    // await redis.connect();
    // console.log("✅ Connected to Redis");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  }
}

startServer();
