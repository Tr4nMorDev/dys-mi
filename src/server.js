// src/server.js
const app = require("./app");
const { Client } = require("pg");

const PORT = process.env.PORT || 3000;
const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  "postgresql://myuser:mypassword@postgres-db:5432/mydatabase";

async function startServer() {
  const client = new Client({
    connectionString: POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1); // Thoát app nếu kết nối fail
  }
}

startServer();
