// backend/controllers/ChatController.js
import Chat from "../models/ChatModel.js";
import mongoose from "mongoose";

/**
 * List chats for a user (participant)
 * GET /api/chat?user=<userId>
 */
export async function listChats(req, res, next) {
  try {
    const { user, limit = 50, cursor } = req.query;
    if (!user) return res.status(400).json({ message: "Missing ?user=<userId>" });

    const q = { participants: new mongoose.Types.ObjectId(user) };
    if (cursor) q._id = { $lt: cursor }; // keyset pagination

    const items = await Chat.find(q)
      .sort({ updatedAt: -1, _id: -1 })
      .limit(Number(limit))
      .lean();

    const nextCursor = items.length ? items[items.length - 1]._id : null;
    res.json({ items, nextCursor });
  } catch (err) { next(err); }
}

/**
 * Get single chat by id
 * GET /api/chat/:id
 */
export async function getChat(req, res, next) {
  try {
    const doc = await Chat.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Chat not found" });
    res.json(doc);
  } catch (err) { next(err); }
}

/**
 * Create a chat (1:1 or group)
 * POST /api/chat
 * body: { title?, participants: [userId,...], isGroup? }
 */
export async function createChat(req, res, next) {
  try {
    const { title, participants = [], isGroup = false, avatarUrl } = req.body;
    if (!participants.length) return res.status(400).json({ message: "participants required" });

    // For 1:1, reuse existing conversation if present
    if (!isGroup && participants.length === 2) {
      const existing = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 },
      }).lean();
      if (existing) return res.status(200).json(existing);
    }

    const doc = await Chat.create({
      title: isGroup ? (title || "New Group") : null,
      participants,
      isGroup,
      avatarUrl,
      lastMessageAt: null,
    });
    res.status(201).json(doc);
  } catch (err) { next(err); }
}

/**
 * Update chat (title / avatar)
 * PATCH /api/chat/:id
 */
export async function updateChat(req, res, next) {
  try {
    const { title, avatarUrl } = req.body;
    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      { $set: { title, avatarUrl } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Chat not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

/**
 * Add participant
 * POST /api/chat/:id/participants
 * body: { userId }
 */
export async function addParticipant(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: userId }, $set: { isGroup: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Chat not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

/**
 * Remove participant
 * DELETE /api/chat/:id/participants/:userId
 */
export async function removeParticipant(req, res, next) {
  try {
    const { id, userId } = req.params;
    const updated = await Chat.findByIdAndUpdate(
      id,
      { $pull: { participants: userId } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Chat not found" });
    res.json(updated);
  } catch (err) { next(err); }
}

/**
 * Delete a chat
 * DELETE /api/chat/:id
 */
export async function deleteChat(req, res, next) {
  try {
    const deleted = await Chat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Chat not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
