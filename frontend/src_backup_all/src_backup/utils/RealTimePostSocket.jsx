// src/utils/RealTimePostSocket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // Change to your backend address

export const emitNewPost = (post) => {
  socket.emit("new_post", post);
};

export const listenForNewPosts = (callback) => {
  socket.on("new_post_broadcast", (data) => {
    callback(data);
  });
};

export default socket;


