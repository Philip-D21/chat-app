import { Request, Response } from "express";
import RoomModel from "../model/room";
import RoomMemberModel from "../model/roomMember";
import MessageModel from "../model/message";
import crypto from "crypto";


export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, isPrivate } = req.body as { name: string; isPrivate: boolean };
    const authUser = (req as any).user as { id: string };

    if (!authUser?.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const inviteCode = crypto.randomBytes(8).toString("hex");
    const room = await RoomModel.create({ name, isPrivate, inviteCode });

    // Add creator as a member
    await RoomMemberModel.create({ userId: authUser.id, roomId: room.id });

    return res.status(201).json({
      status: 'success',
      roomId: room.id,
      inviteLink: `/api/v1/chat/invite/${inviteCode}/join`,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Room creation failed',
    });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id: string };
    const { roomId } = req.params as { roomId: string };

    if (!authUser?.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const room = await RoomModel.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ status: 'error', message: 'Room not found' });
    }

    if ((room as any).isPrivate) {
      return res.status(403).json({ status: 'error', message: 'Private room. Use invite link to join.' });
    }

    const member = await RoomMemberModel.findOne({ where: { userId: authUser.id, roomId } });
    if (member) {
      return res.status(400).json({ status: 'error', message: 'Already in room' });
    }

    const newMember = await RoomMemberModel.create({ userId: authUser.id, roomId });
    return res.json({ status: 'success', message: 'Joined room successfully', newMember });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Room joining failed',
    });
  }
};


export const joinRoomByInvite = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id: string };
    const { inviteCode } = req.params as { inviteCode: string };

    if (!authUser?.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const room = await RoomModel.findOne({ where: { inviteCode } });
    if (!room) {
      return res.status(404).json({ status: 'error', message: 'Invalid invitation link' });
    }

    const member = await RoomMemberModel.findOne({ where: { userId: authUser.id, roomId: room.id } });
    if (member) {
      return res.status(400).json({ status: 'error', message: 'Already in room' });
    }

    const newMember = await RoomMemberModel.create({ userId: authUser.id, roomId: room.id });
    return res.json({ status: 'success', message: 'Joined via invite link', room, newMember });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Room joining failed',
    });
  }
};


export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id: string };
    const { roomId } = req.params as { roomId: string };
    const { limit = '50', offset = '0' } = req.query as { limit?: string; offset?: string };

    if (!authUser?.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const isMember = await RoomMemberModel.findOne({ where: { userId: authUser.id, roomId } });
    if (!isMember) {
      return res.status(403).json({ status: 'error', message: 'Not a member of this room' });
    }

    const parsedLimit = Math.max(1, Math.min(200, parseInt(String(limit), 10) || 50));
    const parsedOffset = Math.max(0, parseInt(String(offset), 10) || 0);

    const messages = await MessageModel.findAll({
      where: { roomId },
      order: [["createdAt", "DESC"]],
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return res.json({ status: 'success', data: messages });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Room fetching failed',
    });
  }
};

export const getUserRooms = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id: string };
    if (!authUser?.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const rooms = await RoomMemberModel.findAll({
      where: { userId: authUser.id },
      include: [RoomModel],
      order: [["createdAt", "DESC"]],
    });
    return res.json({ status: 'success', data: rooms });
  } catch (error: any) {
    return res.status(400).json({ 
      status: 'error',
      message: error.message
    });
  }
};
