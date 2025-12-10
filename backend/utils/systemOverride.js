// utils/systemOverride.js
import { exec } from "child_process";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const restartBackend = () => {
  console.log("🧠 SYSTEM OVERRIDE: Attempting backend recovery...");

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ MongoDB Reconnected");
    })
    .catch((err) => {
      console.error("❌ MongoDB Reconnection Failed", err);
    });

  exec("npm run dev", (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Backend Restart Failed:", error.message);
      return;
    }
    if (stderr) {
      console.error("⚠️ Backend STDERR:", stderr);
    }
    console.log("✅ Backend Restart Output:", stdout);
  });
};
