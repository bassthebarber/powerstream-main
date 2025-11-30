@echo off
title 🧠 PowerStream - Launch + Diagnostics (Win)
cd backend
call npm install
start cmd /k "npm run dev"
cd ..
timeout /t 5 >nul
cd backend
if not exist diagnostics mkdir diagnostics
if not exist diagnostics\PrimeDiagnostics.js (
  echo ❌ Put PrimeDiagnostics.js in backend\diagnostics\
  pause & exit /b 1
)
node diagnostics\PrimeDiagnostics.js
cd ..
echo ✅ Diagnostics complete
pause
