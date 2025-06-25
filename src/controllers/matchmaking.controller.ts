import { RequestHandler } from "express";
import redis from "../config/redis";
import { AuthenticatedRequest } from "../types/express";
import { PrismaClient } from "../generated/prisma/client";
import {
  enqueueUser,
  removeUserFromQueue,
} from "../services/matchmaking.service";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";

export const startmatching: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const id = user?.id;
  if (!id) {
    return res.status(401).json({ message: "Not find id" });
  }
  console.log("id : ", id);

  // await enqueueUser(id);
  return res.status(200).json({
    message: "Waiting for opponent...",
    next: "Connect to WebSocket to receive match updates",
  });
};
export const cancelmatching: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const id = user?.id;
  if (!id) {
    return res.status(401).json({ message: "Not find id" });
  }
  removeUserFromQueue(id);
  return res.status(200).json({
    message: "Hủy tìm trận ...",
  });
};
export const exitmatch: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const id = user?.id;
  if (!id) {
    return res.status(401).json({ message: "Not find id" });
  }
  return res.status(200).json({
    message: "Exit trận ",
  });
};
export default { startmatching, cancelmatching, exitmatch };
