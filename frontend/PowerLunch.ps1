Write-Host "🧹 Cleaning broken files..."
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force

Write-Host "📦 Installing required modules..."
npm install react react-dom
npm install -D vite @vitejs/plugin-react
npm install -D @babel/core @babel/preset-react

Write-Host "✅ Installing complete."
Write-Host "🚀 Launching frontend..."
npm run dev
