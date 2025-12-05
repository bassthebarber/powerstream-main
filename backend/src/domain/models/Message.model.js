// backend/src/domain/models/Message.model.js
// Canonical Message model for PowerStream Chat
// Migrated from /backend/models/Chatmessagemodel.js
import mongoose from "mongoose";

/**
 * Message types
 */
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  FILE: "file",
  SYSTEM: "system",
  VOICE_NOTE: "voice_note",
  STICKER: "sticker",
  GIF: "gif",
};

/**
 * Message status
 */
export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
  FAILED: "failed",
};

const MessageSchema = new mongoose.Schema(
  {
    // ============================================================
    // CONVERSATION & SENDER
    // ============================================================
    room: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ChatRoom", 
      required: true, 
      index: true 
    },
    // Alternative: direct reference to conversation
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },

    // ============================================================
    // CONTENT
    // ============================================================
    type: { 
      type: String, 
      enum: Object.values(MESSAGE_TYPES), 
      default: MESSAGE_TYPES.TEXT 
    },
    text: { type: String, default: "", maxlength: 10000 },
    
    // Media attachment
    media: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "MediaFile" 
    },
    mediaUrl: { type: String },
    mediaThumbnail: { type: String },
    mediaDuration: { type: Number }, // For audio/video
    
    // File attachment
    file: {
      url: String,
      name: String,
      size: Number,
      mimeType: String,
    },

    // ============================================================
    // METADATA
    // ============================================================
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    
    // Reply to another message
    replyTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
    
    // Forward from another message
    forwardedFrom: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // ============================================================
    // DELIVERY STATUS
    // ============================================================
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.SENT,
    },
    deliveredTo: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    readBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    deliveredAt: { type: Date },
    readAt: { type: Date },

    // ============================================================
    // MODERATION
    // ============================================================
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    originalText: { type: String }, // Original text before edit

    // ============================================================
    // REACTIONS
    // ============================================================
    reactions: [{
      emoji: String,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { 
    timestamps: true,
    collection: "messages",
  }
);

// ============================================================
// INDEXES
// ============================================================
MessageSchema.index({ room: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ type: 1 });

// ============================================================
// METHODS
// ============================================================

// Mark as delivered for a user
MessageSchema.methods.markDelivered = async function (userId) {
  if (!this.deliveredTo.includes(userId)) {
    this.deliveredTo.push(userId);
    if (this.status === MESSAGE_STATUS.SENT) {
      this.status = MESSAGE_STATUS.DELIVERED;
      this.deliveredAt = new Date();
    }
    await this.save();
  }
  return this;
};

// Mark as read for a user
MessageSchema.methods.markRead = async function (userId) {
  if (!this.readBy.includes(userId)) {
    this.readBy.push(userId);
    this.status = MESSAGE_STATUS.READ;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Soft delete message
MessageSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Edit message
MessageSchema.methods.edit = async function (newText) {
  if (!this.isEdited) {
    this.originalText = this.text;
  }
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  return this;
};

// Add reaction
MessageSchema.methods.addReaction = async function (userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => r.userId.toString() !== userId.toString()
  );
  // Add new reaction
  this.reactions.push({ userId, emoji, createdAt: new Date() });
  await this.save();
  return this;
};

// Remove reaction
MessageSchema.methods.removeReaction = async function (userId) {
  this.reactions = this.reactions.filter(
    r => r.userId.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

// ============================================================
// STATICS
// ============================================================

// Get messages for a room/conversation with pagination
MessageSchema.statics.getMessages = async function (roomId, options = {}) {
  const { limit = 50, before, after } = options;
  
  const query = { 
    room: roomId, 
    isDeleted: false 
  };
  
  if (before) query.createdAt = { $lt: before };
  if (after) query.createdAt = { ...query.createdAt, $gt: after };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name username avatarUrl")
    .populate("replyTo");
};

// Get unread count for a user in a room
MessageSchema.statics.getUnreadCount = async function (roomId, userId) {
  return this.countDocuments({
    room: roomId,
    sender: { $ne: userId },
    readBy: { $ne: userId },
    isDeleted: false,
  });
};

// Mark all messages as read for a user in a room
MessageSchema.statics.markAllRead = async function (roomId, userId) {
  return this.updateMany(
    {
      room: roomId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
      $set: { status: MESSAGE_STATUS.READ, readAt: new Date() },
    }
  );
};

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

// Also export as ChatMessage for backwards compatibility
export const ChatMessage = Message;

export default Message;
export { MessageSchema };

