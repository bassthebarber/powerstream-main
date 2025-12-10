#!/bin/bash
# PowerSystemChief.sh
# Production deployment script for PowerStream + PowerHarmony
# Run on Linux server: sudo chmod +x PowerSystemChief.sh && sudo bash PowerSystemChief.sh

echo "=== ⚡ POWERSTREAM + POWERHARMONY SYSTEM CHIEF WIRING SCRIPT ⚡ ==="

set -e

# 1️⃣ Ensure core directories exist
echo "→ Checking directory structure..."
for d in \
  /root/powerharmony/backend/ai/beat-engine \
  /root/powerharmony/backend/routes \
  /root/powerharmony/frontend/src/components/studio \
  /var/www/studio/beats \
  /var/www/studio/ui-live
do
  [ -d "$d" ] || sudo mkdir -p "$d"
done

# 2️⃣ Permissions
sudo chown -R root:www-data /var/www/studio
sudo chmod -R 775 /var/www/studio

# 3️⃣ Backend dependencies
echo "→ Installing backend dependencies..."
cd /root/powerharmony/backend
npm install express body-parser wavefile
sudo apt-get update -y && sudo apt-get install -y ffmpeg

# 4️⃣ Frontend dependencies
echo "→ Installing frontend dependencies..."
cd /root/powerharmony/frontend
npm install react react-dom vite @vitejs/plugin-react wavesurfer.js

# 5️⃣ Build frontend
echo "→ Building frontend..."
if [ -f "vite.config.js" ]; then
  npm run build || echo "⚠️ Build failed, will retry after NODE_ENV fix."
else
  echo "⚠️ vite.config.js not found — create or copy default config before build."
fi

# 6️⃣ Deploy static UI
if [ -d "dist" ]; then
  echo "→ Deploying new UI..."
  sudo rm -rf /var/www/studio/ui-live/*
  sudo cp -r dist/* /var/www/studio/ui-live/
else
  echo "⚠️ No dist folder yet (frontend build likely failed)."
fi

# 7️⃣ Restart backend services
echo "→ Restarting backend..."
if command -v pm2 &>/dev/null; then
  pm2 restart all || pm2 start server.js --name powerharmony
else
  node server.js &
fi

# 8️⃣ Diagnostics summary
echo "=== ✅ POWERSTREAM DIAGNOSTIC SUMMARY ==="
sudo lsof -i -P -n | grep LISTEN | grep -E "5001|9000|9100" || echo "⚠️ Expected ports not yet open."
echo "Backend log tail:"
sudo tail -n 10 /root/powerharmony/backend/server.log 2>/dev/null || echo "No server log yet."
echo "Frontend build status:"
[ -d dist ] && echo "✅ dist folder ready" || echo "⚠️ dist folder missing"

echo "=== ⚡ POWERSTREAM SYSTEM CHIEF COMPLETE ⚡ ==="
echo "All done."


