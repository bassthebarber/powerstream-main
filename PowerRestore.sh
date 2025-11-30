#!/bin/bash

echo "🚀 Starting PowerStream Frontend Repair..."

# Remove node_modules and lock files
echo "🧹 Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json yarn.lock 2>/dev/null

# Reinstall dependencies
echo "📦 Installing packages..."
npm install

# Optional: Patch Vite aliases (only if you use @ as a path shortcut)
if [ -f "vite.config.js" ]; then
  echo "🛠️ Patching vite.config.js..."
  if ! grep -q "@: '/src'" vite.config.js; then
    echo "
    resolve: {
      alias: {
        '@': '/src',
      },
    }," >> vite.config.js
  fi
fi

# Launch the dev server
echo "💻 Launching PowerStream frontend..."
npm run dev

