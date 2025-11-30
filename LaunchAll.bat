@echo off
echo 🚀 PowerStream Prime: Full Stack Launch Mode Activated...

REM ---- START BACKEND ----
cd backend
call npm install
start cmd /k "npm run dev"
cd ..

REM ---- START FRONTEND ----
cd frontend
call npm install
start cmd /k "npm start"
cd ..

REM ---- RUN DIAGNOSTICS ----
echo 🧠 Running Prime Diagnostics...
cd backend
node diagnostics\PrimeDiagnostics.js
cd ..

echo ✅ PowerStream Full Stack Launched.
pause
