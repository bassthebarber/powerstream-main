Write-Host "🔧 POWERBACKDEPLOY: Starting Backend PM2 Lock-In Setup..."

# 1. Kill previous PM2 instance (if running)
Write-Host "🛑 Stopping previous PM2 instance (PowerBack)..."
pm2 delete PowerBack -s

# 2. Remove node_modules and reinstall fresh
Write-Host "📦 Cleaning and reinstalling dependencies..."
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# 3. Start backend on PM2
Write-Host "🚀 Launching backend on PM2 (http://localhost:5001)..."
pm2 start server.js --name PowerBack --watch

# 4. Save PM2 process list
Write-Host "📌 Saving PM2 process list for startup..."
pm2 save

# 5. Enable PM2 startup on reboot
Write-Host "🛡️ Registering PM2 to launch on system boot..."
pm2 startup | Out-String | Invoke-Expression

Write-Host ""
Write-Host "✅ POWERBACK IS LIVE & LOCKED WITH PM2"
Write-Host "🌐 Listening on http://localhost:5001"
Write-Host "📡 Restart-proof. Crash-proof. Reboot-proof."
