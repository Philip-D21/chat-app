import { Router } from "express";
import { createRoom, joinRoom, joinRoomByInvite, getRoomMessages, getUserRooms } from "../controllers/chat";
import { authenticate } from "../middleware/verifyJWT";


const router = Router();

// protect all chat routes
router.use(authenticate);

router.post("/rooms", authenticate, createRoom); // create a room
router.post("/rooms/:roomId/join", authenticate, joinRoom); // join a room by room Id
router.post("/invite/:inviteCode/join", authenticate,  joinRoomByInvite); // join a room by invite code
router.get("/rooms/:roomId/messages", authenticate, getRoomMessages); // get chat history
router.get("/rooms", authenticate, getUserRooms); // list user rooms


export default router;