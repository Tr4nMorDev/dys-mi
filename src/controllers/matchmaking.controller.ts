import { RequestHandler } from "express";

export const start: RequestHandler = async (req, res) => {
  console.log("Matchmaking started");
  res.status(200).json({ message: "Matchmaking started" });
};

export default { start };
