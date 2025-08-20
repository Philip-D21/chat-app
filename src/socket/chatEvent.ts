// src/socket/chat.ts
import { Server, Socket } from "socket.io";
import { verifyToken } from "../middleware/verifyJWT"; // your helper
import  MessageModel  from "../model/message";
import  RoomMemberModel from "../model/roomMember";

interface JwtPayload {
  id: string;
  username: string;
}

// Online tracking
const onlineUsers = new Map<string, string>(); // userId -> socketId
const lastSeen = new Map<string, Date>();

// Rate limit: 5 messages per 10 seconds per user/room
const msgBuckets = new Map<string, { count: number; started: number }>();
function checkBucket(userId: string, roomId: string, windowMs = 10_000, max = 5) {
  const key = `${userId}:${roomId}`;
  const now = Date.now();
  const bucket = msgBuckets.get(key);

  if (!bucket || now - bucket.started > windowMs) {
    msgBuckets.set(key, { count: 1, started: now });
    return true;
  }

  if (bucket.count < max) {
    bucket.count++;
    return true;
  }

  return false;
}

// Check membershs in db
async function isMember(userId: string, roomId: string): Promise<boolean> {
  const member = await RoomMemberModel.findOne({ where: { userId, roomId } });
  return !!member;
}

export default function chatSocket(io: Server) {
  io.on("connection", async (socket: Socket) => {
    console.log("Connected to socket.io")
    // ✅ authenticate user with the verifyToken func
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.headers["authorization"]
        ? (socket.handshake.headers["authorization"] as string).replace(/^Bearer\\s+/i, "")
        : null);

    const user = token ? (verifyToken(token) as JwtPayload | null) : null;

    if (!user) {
      socket.emit("error", { message: "Unauthorized" });
      return socket.disconnect();
    }

    // attach user to socket
    (socket as any).user = user;

    // presence: user online
    onlineUsers.set(user.id, socket.id);
    io.emit("user_status", { userId: user.id, status: "online" });

    // join a room
    socket.on("join_room", async ({ roomId }: { roomId: string }) => {
      if (!(await isMember(user.id, roomId))) {
        return socket.emit("error", { message: "Not a member of this room" });
      }

      socket.join(`room_${roomId}`);
      io.to(`room_${roomId}`).emit("user_status", { userId: user.id, status: "online" });
    });

    // send a message
    socket.on("send_message", async ({ roomId, content }: { roomId: string; content: string }) => {
      if (!(await isMember(user.id, roomId))) {
        return socket.emit("error", { message: "Not a member of this room" });
      }

      if (!content || !content.trim()) return;
      if (!checkBucket(user.id, roomId)) {
        return socket.emit("error", { message: "Rate limit exceeded" });
      }

      try {
        const message = await MessageModel.create({
          roomId,
          senderId: user.id,
          content: content.trim().slice(0, 4000),
        });

        io.to(`room_${roomId}`).emit("receive_message", message);
      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // typing indicator
    socket.on("typing", ({ roomId, isTyping }: { roomId: string; isTyping: boolean }) => {
      socket.to(`room_${roomId}`).emit("typing", { userId: user.id, isTyping });
    });

    // disconnect
    socket.on("disconnect", async () => {
      onlineUsers.delete(user.id);
      const seen = new Date();
      lastSeen.set(user.id, seen);
      // persist last seen in DB
      try {
        const { default: UserModel } = await import("../model/user");
        await UserModel.update({ lastSeen: seen }, { where: { id: user.id } });
      } catch (e) {
        // ignore persistence errors for presence
      }
      io.emit("user_status", { userId: user.id, status: "offline", lastSeen: lastSeen.get(user.id) });
    });

    // delivery receipts
    socket.on("message_delivered", async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      if (!(await isMember(user.id, roomId))) return;
      try {
        await MessageModel.update({ deliveredAt: new Date() }, { where: { id: messageId, roomId } });
        io.to(`room_${roomId}`).emit("message_delivered", { messageId, roomId });
      } catch {}
    });

    socket.on("message_read", async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      if (!(await isMember(user.id, roomId))) return;
      try {
        await MessageModel.update({ readAt: new Date() }, { where: { id: messageId, roomId } });
        io.to(`room_${roomId}`).emit("message_read", { messageId, roomId, userId: user.id });
      } catch {}
    });
  });
}
