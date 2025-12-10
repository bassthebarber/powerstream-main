# PowerLine Messenger V3 - Developer Documentation

**Version:** 3.0  
**Date:** December 7, 2025  
**Author:** PowerStream Engineering

---

## Overview

PowerLine Messenger V3 is a complete rebuild of the PowerLine chat experience, designed to look and feel like Facebook Messenger while maintaining the PowerStream black + gold aesthetic.

---

## Features

### ✅ Conversation List (Sidebar)
- Displays all conversations for the logged-in user
- Shows avatar (image or letter fallback with color)
- Displays participant name
- Shows last message preview (truncated)
- Shows time of last message (e.g., "5m", "2h", "Yesterday")
- Highlights active/selected conversation
- Client-side search filter
- Unread message badges

### ✅ New Chat Modal
- "New Chat" button in sidebar header
- User search by name/email
- Creates or reuses existing 1:1 conversation
- Smooth transition to chat window after creation

### ✅ Chat Window
- Header with contact name, avatar, online status indicator
- Audio/video call buttons (with "Coming Soon" modal)
- Message bubbles:
  - Right-aligned (gold) for "me"
  - Left-aligned (dark) for "them"
  - Timestamps on each bubble
- Auto-scroll to latest message
- Message input with "Send a message…" placeholder
- Enter to send, Shift+Enter for newline
- Optimistic message updates

### ✅ Typing Indicators
- Emits `chat:typing` event on keypress
- Emits `chat:typing_stop` after 2s inactivity or send
- Shows "X is typing..." banner below header
- Animated typing bubble in message list

### ✅ Message Reactions
- Supported reactions: 👍 (like), ❤️ (love), 🔥 (fire)
- Hover to reveal reaction picker
- Toggle reaction on/off
- Shows reaction badges on messages
- Real-time sync via Socket.IO

### ✅ Avatars
- Uses `user.avatarUrl` if available
- Falls back to first letter of name
- Colored background based on name hash

### ✅ Call UI
- Audio and video call buttons in chat header
- Checks `VITE_WEBRTC_ENABLED` env variable
- Shows "Calls Coming Soon" modal if WebRTC not configured
- Ready for future WebRTC integration

---

## Files Changed

### Frontend

| File | Description |
|------|-------------|
| `frontend/src/pages/PowerLine.jsx` | Main page with 3-column layout, call modal |
| `frontend/src/components/ChatSidebar.jsx` | Conversation list, new chat modal, user search |
| `frontend/src/components/ChatWindow.jsx` | Messages, reactions, typing, input |
| `frontend/src/styles/powerline.css` | All PowerLine-specific styles |

### Backend

| File | Description |
|------|-------------|
| `backend/models/ChatMessageModel.js` | Added `reactions` field |
| `backend/controllers/chatmessageController.js` | Added `addReaction`, `removeReaction` |
| `backend/routes/chatRoutes.js` | Added reaction routes |
| `backend/routes/userRoutes.js` | Added `/users/search` endpoint |

---

## API Endpoints

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/powerline/conversations?user={userId}` | List user's conversations |
| GET | `/api/chat?user={userId}` | Alternative conversation list |
| POST | `/api/chat` | Create new conversation |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/{chatId}/messages` | List messages in chat |
| POST | `/api/chat/{chatId}/messages` | Send message |

### Reactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/{chatId}/messages/{messageId}/reactions` | Add/toggle reaction |
| DELETE | `/api/chat/{chatId}/messages/{messageId}/reactions` | Remove reaction |

**Reaction body:**
```json
{
  "type": "like" | "love" | "fire",
  "userId": "user_id"
}
```

### User Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q={query}&limit={n}` | Search users by name/email |

---

## Data Shapes

### Chat (Conversation)

```javascript
{
  _id: ObjectId,
  participants: [{ _id, name, displayName, avatarUrl, email }],
  title: String,  // for group chats
  isGroup: Boolean,
  lastMessageAt: Date,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  // Computed fields from backend:
  name: String,       // display name (other user's name for 1:1)
  avatarUrl: String,  // other user's avatar for 1:1
  otherUser: Object   // full other user object
}
```

### ChatMessage

```javascript
{
  _id: ObjectId,
  chat: ObjectId,
  author: ObjectId | { _id, name, displayName, avatarUrl },
  text: String,
  media: [String],  // URLs
  reactions: [
    {
      user: ObjectId,
      type: "like" | "love" | "fire",
      createdAt: Date
    }
  ],
  readBy: [ObjectId],
  deletedAt: Date | null,
  createdAt: Date,
  updatedAt: Date,
  // Computed fields from backend:
  authorName: String,
  user: Object  // populated author object
}
```

---

## Socket.IO Events

### Namespace: `/chat`

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `chat:join` | Client → Server | `chatId` | Join chat room |
| `chat:leave` | Client → Server | `chatId` | Leave chat room |
| `chat:message` | Bidirectional | `{ chatId, text }` or message object | Send/receive message |
| `chat:typing` | Client → Server | `{ chatId, userName }` | User started typing |
| `chat:typing_stop` | Client → Server | `{ chatId }` | User stopped typing |
| `chat:reaction` | Server → Client | `{ messageId, reactions }` | Reaction updated |

### Triggering Typing Events

```javascript
// Start typing (emit on first keypress)
socket.emit("chat:typing", { 
  chatId: conversationId,
  userName: currentUserName
});

// Stop typing (emit after 2s inactivity or on send)
socket.emit("chat:typing_stop", { chatId: conversationId });
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_WEBRTC_ENABLED` | `false` | Enable WebRTC call buttons |
| `VITE_WEBRTC_SIGNALING_URL` | - | WebRTC signaling server URL |

---

## Testing Checklist

- [ ] Log in as a user
- [ ] Navigate to `/powerline`
- [ ] See conversation list in sidebar
- [ ] Click a conversation → see messages load
- [ ] Type message → see "Typing..." in another session
- [ ] Send message → appears immediately
- [ ] Hover message → show reaction picker
- [ ] Add reaction → badge appears
- [ ] Click "New Chat" → modal opens
- [ ] Search user → results appear
- [ ] Select user → conversation created
- [ ] Click call button → "Coming Soon" modal

---

## Known Limitations

1. **WebRTC Calls** - Not yet implemented, shows "Coming Soon" modal
2. **File Attachments** - Placeholder buttons, not functional yet
3. **Group Chats** - Backend supports it, but UI focuses on 1:1
4. **Read Receipts** - `readBy` field exists but not displayed
5. **Message Deletion** - Backend supports it, no UI yet

---

## Future Enhancements

- Real WebRTC audio/video calls
- File and image attachments
- Group chat creation and management
- Read receipts display
- Message editing and deletion
- Emoji picker integration
- Voice messages
- Message search

---

## Notes

- All changes are scoped to PowerLine only
- No modifications to global styles or other pages
- Backward compatible with existing chat data
- Uses existing auth token (`powerstream_token`)
- Socket.IO namespace unchanged (`/chat`)


