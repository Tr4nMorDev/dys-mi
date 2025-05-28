import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // đảm bảo biến môi trường được load từ .env

const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL ||
    "postgresql://myuser:mypassword@localhost:5437/mydatabase",
});

export default pool;
