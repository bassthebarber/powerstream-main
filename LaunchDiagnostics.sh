#!/bin/bash
set -e
echo "🧠 PowerStream - Launch + Diagnostics (Unix)"
( cd backend && npm install && npm run dev & )
sleep 5
node backend/diagnostics/PrimeDiagnostics.js
echo "✅ Diagnostics complete"
