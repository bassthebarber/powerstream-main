// backend/src/sockets/index.js
// Central socket module exports
export { default as attachChatSocket } from "./chat.socket.js";
export { default as attachStreamSocket, getStreamViewerCount } from "./stream.socket.js";
export { default as attachStationsSocket, broadcastStationStatus, getStationViewerCount } from "./stations.socket.js";
export { default as attachPresenceSocket, isUserOnline, getUserStatus, getOnlineUsers } from "./presence.socket.js";
export { default as attachStudioSocket, getSessionInfo } from "./studio.socket.js";



