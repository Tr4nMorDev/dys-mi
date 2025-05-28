// src/server.ts

import app from "./app";
import pool from "./config/db";
import { Request, Response } from "express";

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    // Kiểm tra kết nối đến PostgreSQL
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");

    // Gắn pool vào app.locals để sử dụng trong các middleware, routes, v.v.
    app.locals.db = pool;

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  }
}

startServer();
