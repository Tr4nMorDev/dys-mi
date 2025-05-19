// src/config/db.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ||
    "postgresql://myuser:mypassword@localhost:5437/mydatabase", // ✅ ĐÚNG
});

module.exports = pool;
