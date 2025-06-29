import redis from "../config/redis";
import { Server, Socket } from "socket.io";
import matchAIService from "../services/matchAI.service";
import { checkIsWin } from "../utils/gameLogic";
import axios from 'axios';
export function playgamewithAI(io : Server) {
    io.on("connection" ,(socket : Socket) => {
        const user = socket.data.user;
        console.log(`🔌 New connection: ${socket.id}`);
        socket.on("move",async ({ index, board }) => {
            console.log("move rồi đó bây giừo tới lượt AI")
            console.log(index , board)
            // lấy trạng thái socket của id đó và set nó 
            await redis.set(`board:${user.id}`, JSON.stringify(board));
            // check win
            if (checkIsWin(board, index, "X")) {
                return io.to(socket.id).emit("AImove", {
                index,
                symbol: "X",
                isWin: true,
                winnerId: user.id
                });
            }
            const promt = "hello bạn nha =))";
            // Gọi AI để lấy nước đi mới
            const aiMoveIndex = await CallPromtAI(promt);
            console.log(aiMoveIndex);
            // nếu chưa win thì bắt đầu call Promt AI 
            // check win tiếp 
            
            const aiWin = checkIsWin(board, aiMoveIndex, "O");
            // emit tới người đang chơi 
            // thời gian tối đa chơi game giữa 2 đứa đó là 30s 
            // dữ kiện move là index chỉ mục , 
        })
    })
}

export async function CallPromtAI(prompt : string) {
  const res = await axios.post('http://localhost:11434/api/generate', {
    model: 'mistral',
    prompt,
    stream: false
  });
  return res.data.response;
}
export function handleTimeout (){}