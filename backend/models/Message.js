// backend/models/Message.js
// PowerLine Message model per Overlord Spec
import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    emoji: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    // Conversation this message belongs to
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    
    // Sender of the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    // Message content
    text: {
      type: String,
      default: "",
      maxlength: 10000,
    },
    
    // Message type
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      default: "text",
    },
    
    // Media attachments
    media: [{
      url: String,
      type: String, // 'image', 'video', 'audio', 'file'
      mimeType: String,
      name: String,
      size: Number,
      thumbnailUrl: String,
      duration: Number, // for audio/video
    }],
    
    // Reactions
    reactions: [reactionSchema],
    
    // Read receipts
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now },
    }],
    
    // Delivered to
    deliveredTo: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      deliveredAt: { type: Date, default: Date.now },
    }],
    
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    
    // Message status
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    
    // Edit tracking
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    originalText: { type: String },
    
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { 
    timestamps: true,
    collection: "messages",
  }
);

// Indexes for efficient querying
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, sender: 1 });

// Get messages for a conversation with pagination
messageSchema.statics.getForConversation = async function(conversationId, options = {}) {
  const { limit = 50, before, after } = options;
  
  const query = {
    conversation: conversationId,
    isDeleted: false,
  };
  
  if (before) {
    query.createdAt = { $lt: before };
  } else if (after) {
    query.createdAt = { $gt: after };
  }
  
  const messages = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name username avatarUrl")
    .populate("replyTo");
  
  // Return in chronological order
  return messages.reverse();
};

// Mark message as read
messageSchema.methods.markAsRead = async function(userId) {
  const alreadyRead = this.readBy.some(
    r => r.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    this.status = "read";
    await this.save();
  }
  
  return this;
};

// Add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({ user: userId, emoji });
  await this.save();
  
  return this;
};

// Remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  await this.save();
  
  return this;
};

// Soft delete
messageSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  
  return this;
};

// Edit message
messageSchema.methods.edit = async function(newText) {
  if (!this.isEdited) {
    this.originalText = this.text;
  }
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  
  return this;
};

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;


