@echo off
title 🧨 PowerStream SUPERBOOT (Windows)
setlocal

echo [CLEAN] backend node_modules
cd backend
if exist node_modules rmdir /s /q node_modules
call npm cache verify
call npm ci

echo [PATCH] ensure critical routes exist
if not exist routes mkdir routes
if not exist routes\feedRoutes.js (
  > routes\feedRoutes.js echo import express from "express";
  >> routes\feedRoutes.js echo const router=express.Router();
  >> routes\feedRoutes.js echo router.get("/",(_req,res)=>res.json({ok:true,feed:"alive"}));
  >> routes\feedRoutes.js echo export default router;
)
if not exist routes\commandRoutes.js (
  > routes\commandRoutes.js echo import express from "express";
  >> routes\commandRoutes.js echo const router=express.Router();
  >> routes\commandRoutes.js echo router.post("/",(req,res)=>res.json({ok:true,received:req.body?.command||null}));
  >> routes\commandRoutes.js echo export default router;
)

echo [START] backend 5001
start cmd /k "npm run dev"
cd ..

echo [CLEAN] frontend node_modules
cd frontend
if exist node_modules rmdir /s /q node_modules
call npm cache verify
call npm ci

echo [START] frontend 3000
start cmd /k "npm start"
cd ..

echo [VERIFY] backend health
timeout /t 6 >nul
powershell -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:5001/api/health).StatusCode" 2>nul | find "200" >nul && echo ✅ Backend OK || echo ❌ Backend not healthy
powershell -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:5001/api/feed).StatusCode" 2>nul | find "200" >nul && echo ✅ Feed OK || echo ❌ Feed not responding

echo ✅ SUPERBOOT done
pause
