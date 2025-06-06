import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

console.log("🔌 Connecting to Redis at:", REDIS_URL);

const redis = createClient({ url: REDIS_URL });

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redis.connect();
      isConnected = true;
      console.log("✅ Redis connected");
    } catch (err) {
      console.error("❌ Redis connection failed", err);
    }
  }
};

export default redis;
