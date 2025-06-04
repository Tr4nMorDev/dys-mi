import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();
console.log("Connecting to Redis at:", process.env.REDIS_URL);
const redis = createClient({
  url: process.env.REDIS_URL || "redis://redisssss:6379",
});

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redis
  .connect()
  .then(() => console.log("✅ Redis connected"))
  .catch((err) => console.error("❌ Redis connection failed", err));

export default redis;
