@echo off
title 🚀 Launching PowerStream Backend
echo [⚡] Initializing PowerStream backend system...

REM --- Step 1: Auto-fix broken files ---
echo [🔧] Validating critical backend routes...
IF NOT EXIST routes\feedRoutes.js (
  echo // fallback feedRoutes.js > routes\feedRoutes.js
)

IF NOT EXIST routes\commandRoutes.js (
  echo import express from "express"; > routes\commandRoutes.js
  echo const router = express.Router(); >> routes\commandRoutes.js
  echo router.get("/", (_req, res) => res.json({ ok: true })); >> routes\commandRoutes.js
  echo export default router; >> routes\commandRoutes.js
)

REM --- Step 2: Ensure node_modules ---
echo [📦] Installing backend dependencies...
call npm install

REM --- Step 3: Launch server ---
echo [🚀] Starting backend server on port 5001...
call npm run dev || node server.js

pause
