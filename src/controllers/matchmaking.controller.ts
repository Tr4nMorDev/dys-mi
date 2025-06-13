import { RequestHandler } from "express";
import redis from "../lib/redis";
import { AuthenticatedRequest } from "../types/express";
import { PrismaClient } from "../generated/prisma/client";
import {
  enqueueUser,
  removeUserFromQueue,
} from "../services/matchmaking.service";
const prisma = new PrismaClient();
const MATCH_QUEUE_KEY = "matchmaking_queue";
// logic
// 1. Kiểm tra danh sách queue có ai không
// 2. nếu có thì lấy ra biến [] là mảng => được truy xuất bằng i.includes(num);
// 3. thêm vào redis một phần tử id : ( thực hiện logic cập nhật trạng thái game ( waiting : 30s , hết time thì xóa khỏi danh sách chờ + set status game thành timeout trả về frontend ) )
// 4.
//
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

// const currentQueue = (await redis.lRange(MATCH_QUEUE_KEY, 0, -1)) as string[]; // xem toàn bộ danh sách chờ
// // lrage có tham số (string " định danh " , 0 điểm bắt đầu , -1 điểm kết thúc )
// // tương đương thuật toán
// // const array = ["101", "102", "103"];
// // const start = 0 ;
// // const stop = -1 ;
// // function lrangeMock(array , start , stop){
// //   const actualstop  = stop < 0 ?  array.length + stop + 1 : stop + 1 ;
// //   return array.slice(start , actualstop);
// // }
// // const queue = lrangeMock(array , start , stop ) // -> ["101", "102", "103"]
// console.log("currentQueue", currentQueue);
// if (currentQueue.length === 0) {
//   await redis.lPush(MATCH_QUEUE_KEY, id.toString());
//   const waitingMatch = await prisma.match.findFirst({
//     where: {
//       player1Id: id,
//       status: "waiting",
//     },
//   });
//   if (waitingMatch) {
//     const now = new Date();
//     const elapsedSeconds =
//       (now.getTime() - new Date(waitingMatch.createdAt).getTime()) / 1000;

//     if (elapsedSeconds >= 30) {
//       await prisma.match.update({
//         where: { id: waitingMatch.id },
//         data: { status: "timeout" },
//       });

//       // Xoá khỏi Redis hàng chờ
//       await redis.lRem(MATCH_QUEUE_KEY, 0, id.toString());

//       return res
//         .status(408)
//         .json({ message: "No opponent found after 30s. Try again." });
//     }
//   }
// }
// if (currentQueue.length >= 1) {
//   const opponentIdRaw = await redis.lPop(MATCH_QUEUE_KEY); // Lấy người đầu tiên (người vào trước)
//   const opponentId = opponentIdRaw ? parseInt(opponentIdRaw) : null;
//   console.log("opponentId", opponentId);
//   if (!opponentId) {
//     console.log("opponentId", opponentId);
//     // Trường hợp không lấy được id, đẩy mình vào queue lại
//     await redis.lPush(MATCH_QUEUE_KEY, id.toString());
//     return res.status(200).json({ message: "Waiting for opponent..." });
//   }

//   if (opponentId === id) {
//     // Nếu trùng thì chờ
//     await redis.lPush(MATCH_QUEUE_KEY, id.toString());
//     return res.status(200).json({ message: "Waiting for opponent..." });
//   }

//   // Tạo match mới ở DB với player1 là opponent, player2 là mình
//   await prisma.match.create({
//     data: {
//       player1Id: opponentId,
//       player2Id: id,
//       status: "matched",
//       matchedAt: new Date(),
//     },
//   });

//   // }

//   // if (currentQueue.includes(id.toString())) {
//   //   const waitingMatch = await prisma.match.findFirst({
//   //     where: {
//   //       player1Id: id,
//   //       status: "waiting",
//   //     },
//   //   });
//   //   if (waitingMatch) {
//   //     const now = new Date();
//   //     const elapsedSeconds =
//   //       (now.getTime() - new Date(waitingMatch.createdAt).getTime()) / 1000;

//   //     if (elapsedSeconds >= 30) {
//   //       await prisma.match.update({
//   //         where: { id: waitingMatch.id },
//   //         data: { status: "timeout" },
//   //       });

//   //       // Xoá khỏi Redis hàng chờ
//   //       await redis.lRem(MATCH_QUEUE_KEY, 0, id.toString());

//   //       return res
//   //         .status(408)
//   //         .json({ message: "No opponent found after 30s. Try again." });
//   //     }
//   //   }
//   //   return res.status(200).json({ message: "Still waiting for opponent..." });
//   // }

//   // if (currentQueue.length >= 1) {
//   //   const opponentIdRaw = await redis.lpop(MATCH_QUEUE_KEY);
//   //   const opponentId = parseInt(opponentIdRaw as string);

//   //   if (opponentId) {
//   //     await prisma.match.create({
//   //       data: {
//   //         player1Id: opponentId,
//   //         player2Id: id,
//   //         status: "matched",
//   //       },
//   //     });

//   //     return res.status(200).json({ message: "Matched with " + opponentId });
//   //   }
//   // }
//   // await redis.lPush(MATCH_QUEUE_KEY, id.toString());

//   return res.status(200).json({ message: "Waiting for opponent..." });
// }
