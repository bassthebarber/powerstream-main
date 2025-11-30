#!/bin/bash

echo "🔧 PowerStream Restore Script Running..."

# Fix broken dependencies
echo "🛠️ Installing dependencies..."
npm install

# Fix Vite path aliases
echo "🔄 Fixing Vite alias paths..."
if grep -q "@: path.resolve(__dirname, './src')" vite.config.js; then
  echo "✅ Alias already set."
else
  echo "Adding alias..."
  sed -i '/resolve: {/a \ \ \ \ alias: {\n \ \ \ \ \ \ "@": path.resolve(__dirname, "./src")\n \ \ \ \ },' vite.config.js
fi

# Rebuild app
echo "🚀 Rebuilding the app..."
npm run dev

echo "✅ PowerRestore complete. Visit http://localhost:5173"
