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
    } catch (err) {
      console.error("❌ Redis connection failed", err);
    }
  }
};

export async function logTotalRedisKeys() {
  try {
    const total = await redis.dbSize(); // 👈 Lấy số lượng keys
    console.log(`📦 Tổng số Redis keys hiện tại: ${total}`);
  } catch (err) {
    console.error("❌ Lỗi khi đếm Redis keys:", err);
  }
}
export async function listAllRedisKeys() {
  try {
    const keys = await redis.keys("*");
    console.log(`📦 Có ${keys.length} keys:`);
    keys.forEach((key) => console.log(" -", key));
  } catch (err) {
    console.error("❌ Không thể liệt kê Redis keys:", err);
  }
}
export default redis;
