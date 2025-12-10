// backend/models/Conversation.js
// PowerLine Conversation model per Overlord Spec
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Participants in this conversation
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    
    // Optional title for group conversations
    title: {
      type: String,
      default: null,
    },
    
    // Is this a group chat?
    isGroup: {
      type: Boolean,
      default: false,
    },
    
    // Group avatar (for group chats)
    avatarUrl: {
      type: String,
      default: null,
    },
    
    // Reference to the last message (for preview)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    
    // Last activity timestamp
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    
    // Creator of the conversation (relevant for groups)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Conversation settings
    settings: {
      muteNotifications: { type: Boolean, default: false },
      pinned: { type: Boolean, default: false },
    },
    
    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    collection: "conversations",
  }
);

// Index for finding conversations by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivityAt: -1 });
conversationSchema.index({ participants: 1, isGroup: 1 });

// Find or create a 1:1 conversation between two users
conversationSchema.statics.findOrCreateDirect = async function(userId1, userId2) {
  // Look for existing 1:1 conversation
  const existing = await this.findOne({
    isGroup: false,
    participants: { $all: [userId1, userId2], $size: 2 },
    isActive: true,
  });
  
  if (existing) {
    return existing;
  }
  
  // Create new 1:1 conversation
  const conversation = new this({
    participants: [userId1, userId2],
    isGroup: false,
    createdBy: userId1,
  });
  
  await conversation.save();
  return conversation;
};

// Get conversations for a user
conversationSchema.statics.getForUser = async function(userId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({
    participants: userId,
    isActive: true,
  })
    .sort({ lastActivityAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("participants", "name username avatarUrl")
    .populate("lastMessage");
};

const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;


