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
  // await enqueueUser(id);
  return res.status(200).json({
    message: "Waiting for opponent...",
    next: "Connect to WebSocket to receive match updates",
  });
};
export const cancelmatching: RequestHandler = async (req, res) => {
  const { id } = (req as AuthenticatedRequest).user;
  removeUserFromQueue(id);
  return res.status(200).json({
    message: "Hủy tìm trận ...",
  });
};
export const exitmatch: RequestHandler = async (req, res) => {
  const { id } = (req as AuthenticatedRequest).user;
  return res.status(200).json({
    message: "Exit trận ",
  });
};
export default { startmatching, cancelmatching, exitmatch };
