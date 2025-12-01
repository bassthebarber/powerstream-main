#!/usr/bin/env bash
# deploy-studio.sh
# Deployment script for PowerHarmony AI Recording Studio
# Run this on your DigitalOcean droplet to build and deploy the frontend

set -e

# Configuration - adjust these paths for your server
FRONTEND_DIR="/var/www/studio/frontend/studio-app"
WEB_ROOT="/var/www/studio/site"

echo "=============================================="
echo "  PowerHarmony Studio Deployment"
echo "=============================================="
echo ""

# Step 1: Navigate to frontend directory
echo "== Step 1: Navigating to frontend directory =="
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "ERROR: Frontend directory not found: $FRONTEND_DIR"
  echo "Please ensure the repository is cloned to the correct location."
  exit 1
fi
cd "$FRONTEND_DIR"
echo "   Current directory: $(pwd)"

# Step 2: Install dependencies
echo ""
echo "== Step 2: Installing dependencies =="
npm install --production=false

# Step 3: Build production bundle
echo ""
echo "== Step 3: Building production bundle =="
npm run build

# Verify build succeeded
if [ ! -d "$FRONTEND_DIR/dist" ]; then
  echo "ERROR: Build failed - dist directory not created"
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/dist/index.html" ]; then
  echo "ERROR: Build failed - index.html not found in dist"
  exit 1
fi

echo "   Build successful!"
echo "   Output: $FRONTEND_DIR/dist"

# Step 4: Create web root if it doesn't exist
echo ""
echo "== Step 4: Preparing web root =="
if [ ! -d "$WEB_ROOT" ]; then
  echo "   Creating web root directory: $WEB_ROOT"
  mkdir -p "$WEB_ROOT"
fi

# Step 5: Deploy to web root
echo ""
echo "== Step 5: Deploying to web root =="
echo "   Clearing old files from: $WEB_ROOT"
rm -rf "$WEB_ROOT"/*

echo "   Copying new build..."
cp -r "$FRONTEND_DIR/dist/"* "$WEB_ROOT"/

# Verify deployment
if [ -f "$WEB_ROOT/index.html" ]; then
  echo "   Deployment successful!"
else
  echo "ERROR: Deployment failed - index.html not found in web root"
  exit 1
fi

# Step 6: Show deployment summary
echo ""
echo "=============================================="
echo "  DEPLOYMENT COMPLETE"
echo "=============================================="
echo ""
echo "Files deployed to: $WEB_ROOT"
echo ""
echo "Deployed files:"
ls -la "$WEB_ROOT"
echo ""
echo "=============================================="
echo "  NGINX CONFIGURATION REMINDER"
echo "=============================================="
echo ""
echo "Ensure your Nginx config for the studio site includes:"
echo ""
echo "  server {"
echo "      listen 80;"
echo "      server_name studio.southernpowertvmusic.com;"
echo "      root $WEB_ROOT;"
echo "      index index.html;"
echo ""
echo "      location / {"
echo "          try_files \$uri \$uri/ /index.html;"
echo "      }"
echo ""
echo "      location /assets {"
echo "          expires 1y;"
echo "          add_header Cache-Control \"public, immutable\";"
echo "      }"
echo "  }"
echo ""
echo "After updating Nginx config, reload with:"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "=============================================="
echo "  Your Studio should now be live at:"
echo "  https://studio.southernpowertvmusic.com"
echo "=============================================="



