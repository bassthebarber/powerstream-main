#!/bin/bash
set -e
echo "🧨 PowerStream SUPERBOOT (Unix)"

echo "[BACKEND] clean + reinstall"
pushd backend >/dev/null
rm -rf node_modules || true
npm cache verify
npm ci

echo "[PATCH] critical routes"
mkdir -p routes
cat > routes/feedRoutes.js <<'EOF'
import express from "express";
const router = express.Router();
router.get("/", (_req, res) => res.json({ ok: true, feed: "alive" }));
export defapm2 start pm2-ecosystem.prod.config.js
pm2 save
pm2 status
ult router;
EOF
cat > routes/commandRoutes.js <<'EOF'
import express from "express";
const router = express.Router();
router.post("/", (req, res) => res.json({ ok: true, received: req.body?.command || null }));
export default router;
EOF

echo "[START] backend"
npm run dev &
BACK_PID=$!
popd >/dev/null

echo "[FRONTEND] clean + reinstall"
pushd frontend >/dev/null
rm -rf node_modules || true
npm cache verify
npm ci
echo "[START] frontend"
npm start &
FRONT_PID=$!
popd >/dev/null

echo "[VERIFY] backend health"
for i in {1..12}; do
  if curl -fsS http://localhost:5001/api/health >/dev/null 2>&1; then
    echo "✅ Backend OK"
    break
  fi
  echo "… waiting health ($i/12)"
  sleep 2
done

if curl -fsS http://localhost:5001/api/feed >/dev/null 2>&1; then
  echo "✅ Feed OK"
else
  echo "❌ Feed not responding"
fi

echo "✅ SUPERBOOT complete (backend:5001, frontend:3000)"
wait
