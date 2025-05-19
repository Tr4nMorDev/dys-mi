// src/server.js
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Kiểm tra kết nối database
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL");

    // Gắn pool vào app để các route sử dụng
    app.locals.db = pool;

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
    process.exit(1);
  }
}

startServer();
