import redis from "../config/redis";
import { listAllRedisKeys } from "../config/redis";
export const matchAIService = async (id: number)  =>{

    const initialBoard = Array(225).fill(null);
        const matchState = {
          board: initialBoard,
          turn: "X",
          playerXId: id,
          playerOId: "AI",
          turnDeadline: Date.now() + 30_000,
    };
    const matchId = `match:${id}`;
    await redis.set(matchId, JSON.stringify(matchState), {
    EX: 3600, // 1 giờ (3600s)
  });
  await listAllRedisKeys();
  return {
    matchId,
    ...matchState,
  };
}
export const OutMatchAIService = async (id: number) => {
  const matchId = `match:${id}`;
  const result = await redis.del(matchId);
  return result; 
};
export default { matchAIService , OutMatchAIService };