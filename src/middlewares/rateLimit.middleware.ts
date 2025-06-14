import { Request, Response, NextFunction } from "express";
import redis from "../lib/redis";
// const redis = new Redis(); // cấu hình Redis mặc định localhost:6379

const RATE_LIMIT_WINDOW = 60; // 60 giây
const MAX_REQUESTS = 5; // tối đa 5 request trong 60 giây

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req);
    const ip = req.ip;
    const key = `rate_limit_${ip}`;
    const val = await redis.get(key);
    console.log("val : ", val);
    if (!val) {
      await redis.setEx(key, RATE_LIMIT_WINDOW, "1"); // ✅ Dùng setEx chuẩn redis@5
      return next();
    }

    const count = parseInt(val);
    if (count < MAX_REQUESTS) {
      await redis.incr(key); // tăng
      return next();
    }

    res.status(429).json({ message: "Too many requests" });
    await redis.del(key); // xóa key sau khi đã xử lý request
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    next();
  }
  // Implement rate limiting logic here
  // For example, you can use a library like `express-rate-limit` to limit the number of requests per IP address
  // You can also implement a custom logic based on your specific requirements
  // For now, we'll just call the next middleware in the chain
};
