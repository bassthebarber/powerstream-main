// backend/ai/studio/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import dotenv from "dotenv";
import studioRouter from "./StudioRouter.js";
import { initStudioEngine } from "./StudioEngine.js";
import "./jobs/JobWorker.js"; // starts background worker

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use("/api/studio", studioRouter);

initStudioEngine(io);

const PORT = 5100;
server.listen(PORT, () => console.log(`🎧 Studio backend running on ${PORT}`));
