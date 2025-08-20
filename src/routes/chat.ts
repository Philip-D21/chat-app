import { Router } from "express";
import { createRoom, joinRoom, joinRoomByInvite, getRoomMessages, getUserRooms } from "../controllers/chat";
import { authenticate } from "../middleware/verifyJWT";


const router = Router();

// protect all chat routes
router.use(authenticate);

router.post("/rooms", createRoom); // create a room
router.post("/rooms/:roomId/join", joinRoom); // join a room by room Id
router.post("/invite/:inviteCode/join",  joinRoomByInvite); // join a room by invite code
router.get("/rooms/:roomId/messages", getRoomMessages); // get chat history
router.get("/rooms", getUserRooms); // list user rooms


export default router;