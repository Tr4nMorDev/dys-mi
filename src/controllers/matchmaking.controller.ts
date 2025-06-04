import { RequestHandler } from "express";

export const startmatching: RequestHandler = async (req, res) => {
  console.log("Matchmaking started");
  res.status(200).json({ message: "Matchmaking started" });
};

export default { startmatching };
