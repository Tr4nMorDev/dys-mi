import { RequestHandler, Response } from "express";
import { matchAIService , OutMatchAIService } from "../services/matchAI.service"
import { AuthenticatedRequest } from "../types/express";
import { OutgoingMessage } from "node:http";

export const matchAI: RequestHandler = async (req, res) => {
  try{
  const { id } = (req as AuthenticatedRequest).user;
  const result = await matchAIService(id);
  return res.status(200).json(result);
  }catch (err){
    console.log("Gặp bug rồi")
    return err}
}
export const outmatchAI: RequestHandler = async (req,res) => {
  console.log("phần thân :" , req.body);
  const {id} = (req as AuthenticatedRequest).user;
  const result = await OutMatchAIService(id);
  console.log("Đã hoàn thành task");
  return res.status(200).json(result);
}
export default {matchAI , outmatchAI}; 