import { io } from "socket.io-client";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config for socket connection
const socket = io(STUDIO_API_BASE);
export default socket;
