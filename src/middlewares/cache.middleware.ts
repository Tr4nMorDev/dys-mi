import redis from "../config/redis";
import { NextFunction, Request, Response } from "express";

export const cacheUserMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body?.email;
  console.log(email);
  if (!email) return next();
  const key = `email:${email}`;
  const cachedData = await redis.get(key);
  if (cachedData) {
    console.log("Cache hit");
    res.locals.ca;
  }
};

export default cacheUserMiddleware;
