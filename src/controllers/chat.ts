import { Request, Response } from "express";
import  RoomModel  from "../model/room";
import  RoomMemberModel  from "../model/roomMember";
import  MessageModel  from "../model/message";
import crypto from "crypto";


export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, isPrivate } = req.body;

    const inviteCode = crypto.randomBytes(8).toString("hex"); // random code

    const room = await RoomModel.create({ name, isPrivate, inviteCode });

   return res.status(201).json({
      roomId: room.id,
      inviteLink: `https://chat-app-rgvv.onrender.com/invite/${inviteCode}`,
    });
  } catch (error: any) {
   return res.status(400).json({
			status: 'error',
			message: error.message || 'Room creation failed'
		});
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { roomId } = req.params;

    const room = await RoomModel.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // check if already a member
    const member = await RoomMemberModel.findOne({ where: { userId, roomId } });
    if (member) {
      return res.status(400).json({ error: "Already in room" });
    }

    const newMember = await RoomMemberModel.create({ userId, roomId });
    return res.json({ message: "Joined room successfully", newMember });
  } catch (error: any) {
    return res.status(400).json({
			status: 'error',
			message: error.message || 'Room joining failed'
		});
  }
};


export const joinRoomByInvite = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const { inviteCode } = req.params;

    const room = await RoomModel.findOne({ where: { inviteCode } });
    if (!room) {
      return res.status(404).json({ error: "Invalid invitation link" });
    }

    const member = await RoomMemberModel.findOne({ where: { userId, roomId: room.id } });
    if (member) {
      return res.status(400).json({ error: "Already in room" });
    }

    const newMember = await RoomMemberModel.create({ userId, roomId: room.id });
    res.json({ message: "Joined via invite link", room, newMember });
  } catch (error: any) {
   return res.status(400).json({
			status: 'error',
			message: error.message || 'Room joining failed'
		});
  }
};


export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const messages = await MessageModel.findAll({
      where: { roomId },
      order: [["createdAt", "ASC"]],
    });
   return res.json(messages);
  } catch (error: any) {
   return res.status(400).json({
			status: 'error',
			message: error.message || 'Room fetching failed'
		});
  }
};

export const getUserRooms = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const rooms = await RoomMemberModel.findAll({
      where: { userId },
      include: [RoomModel],
    });
    res.json(rooms);
  } catch (error: any) {
  return res.status(400).json({ 
    status: 'error',
    message: error.message
  });
}
};
