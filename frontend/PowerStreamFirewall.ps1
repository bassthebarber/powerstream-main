# PowerStreamFirewall.ps1
# 🔒 Launch & Validate Script for PowerStream (Frontend)

Write-Host "`n🧠 PowerStream Firewall Launch Sequence Initialized..."

# Set paths
$frontendPath = Get-Location
$backendPath = "$frontendPath\..\backend"

# Step 1: Verify critical frontend components
$requiredFrontend = @(
  "src\components\PowerFeed\PowerFeed.jsx",
  "src\components\PowerGram\PowerGram.jsx",
  "src\components\PowerReels\PowerReels.jsx",
  "src\components\PowerLine\PowerLinePanel.jsx",
  "src\components\Welcome\Welcome.jsx",
  "src\App.js",
  "src\supabaseClient.js",
  "src\components\Auth\Auth.jsx"
)

Write-Host "`n🔍 Checking Frontend Component Integrity..."
foreach ($file in $requiredFrontend) {
  if (-Not (Test-Path $file)) {
    Write-Host "❌ Missing: $file" -ForegroundColor Red
  } else {
    Write-Host "✅ Found: $file"
  }
}

# Step 2: Check .env.local for Supabase config
$envPath = ".env.local"
if (Test-Path $envPath) {
  $envContent = Get-Content $envPath
  if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
    Write-Host "✅ Supabase env keys loaded"
  } else {
    Write-Host "❌ Supabase keys missing from .env.local" -ForegroundColor Red
  }
} else {
  Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

# Step 3: Ping backend server (localhost:5001/health)
Write-Host "`n🌐 Verifying backend connectivity..."
try {
  $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -eq 200) {
    Write-Host "🟢 Backend is running on port 5001"
  } else {
    Write-Host "❌ Backend responded with error" -ForegroundColor Red
  }
} catch {
  Write-Host "❌ Backend not reachable on port 5001. Start it manually if needed." -ForegroundColor Red
}

# Step 4: Clear Vite + node_modules cache
Write-Host "`n🧼 Cleaning Vite cache and preparing launch..."
Remove-Item -Recurse -Force node_modules/.vite, dist 2>$null

# Step 5: Install frontend packages if missing
if (-Not (Test-Path "node_modules")) {
  Write-Host "📦 Installing frontend dependencies..."
  npm install
} else {
  Write-Host "✅ node_modules already exists"
}

# Step 6: Launch frontend on port 5173
Write-Host "`n🚀 Launching PowerStream frontend on http://localhost:5173"
Start-Process powershell -ArgumentList "npm run dev" -NoNewWindow
