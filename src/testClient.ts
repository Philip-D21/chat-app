import { io } from "socket.io-client";

// point to your backend
const socket = io("http://localhost:2025", {
  transports: ["websocket"],   // force WebSocket
  auth: {
    token: "YOUR_JWT_TOKEN",   // pass JWT if required
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to server with id:", socket.id);

  // join a room
  socket.emit("join_room", { userId: 1, roomId: 123 });

  // send a test message
  socket.emit("send_message", {
    roomId: 123,
    senderId: 1,
    content: "Hello from test client!",
  });
});

socket.on("receive_message", (msg) => {
  console.log("📩 New message:", msg);
});

socket.on("user_status", (status) => {
  console.log("👤 User status update:", status);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});
