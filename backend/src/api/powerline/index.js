// backend/src/api/powerline/index.js
// PowerLine API Module - Complete Exports

// Routes
export { default as powerlineRoutes } from "./powerline.routes.js";
export { default as conversationsRoutes } from "./conversations.routes.js";
export { default as messagesRoutes } from "./messages.routes.js";

// Controllers
export * as powerlineController from "./powerline.controller.js";
export * as conversationsController from "./conversations.controller.js";
export * as messagesController from "./messages.controller.js";

// Socket
export { default as initPowerlineSocket } from "./powerline.socket.js";

// Combined router for mounting all PowerLine routes
import { Router } from "express";
import powerlineRoutes from "./powerline.routes.js";
import conversationsRoutes from "./conversations.routes.js";
import messagesRoutes from "./messages.routes.js";

const router = Router();

// Mount all PowerLine routes
router.use("/", powerlineRoutes);
router.use("/conversations", conversationsRoutes);
router.use("/", messagesRoutes);

export default router;
