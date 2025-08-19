import { Server, Socket } from "socket.io";
import  { MessageModel } from "../model/message";

const onlineUsers = new Map<number, string>(); // userId -> socketId

export default function chatSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected", socket.id);

    // join room
    socket.on("join_room", ({ userId, roomId }) => {
      socket.join(`room_${roomId}`);
      onlineUsers.set(userId, socket.id);
      io.to(`room_${roomId}`).emit("user_status", { userId, status: "online" });
    });

    // send message
    socket.on("send_message", async ({ roomId, senderId, content }) => {
      if (!content.trim()) return;

      const message = await MessageModel.create({ roomId, senderId, content });
      io.to(`room_${roomId}`).emit("receive_message", message);
    });

    // typing event
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(`room_${roomId}`).emit("typing", { userId });
    });

    // disconnect
    socket.on("disconnect", () => {
      const userId = [...onlineUsers.entries()]
        .find(([_, sId]) => sId === socket.id)?.[0];
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user_status", { userId, status: "offline", lastSeen: new Date() });
      }
      console.log("Client disconnected", socket.id);
    });
  });
}
