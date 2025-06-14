// src/socket/socket.middleware.ts
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyToken } from "../middlewares/verifyToken";

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const token = socket.handshake.auth?.token;
  //console.log(token);
  if (!token) return next(new Error("Missing token"));

  try {
    const user = await verifyToken(token);
    socket.data.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
