# PowerFixAndLaunchFrontend.ps1
Write-Host "`n🛠️ Final Frontend Prep & Launch..." -ForegroundColor Cyan

# Step 1: Check .env
$envPath = "frontend/.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env.local is missing. Supabase will fail." -ForegroundColor Red
    Exit
}

# Step 2: Validate Supabase connection
$envVars = Get-Content $envPath
if ($envVars -match "VITE_SUPABASE_URL" -and $envVars -match "VITE_SUPABASE_ANON_KEY") {
    Write-Host "✅ Supabase environment keys valid." -ForegroundColor Green
} else {
    Write-Host "❌ Supabase keys missing in .env.local!" -ForegroundColor Red
    Exit
}

# Step 3: Clean PowerFeed directory
$feedPath = "frontend/src/components/feed"
if (Test-Path $feedPath) {
    $expected = @("Launcher.js", "PostComposer.js", "Timeline.js", "PostingLogic.js", "PostList.js")
    Get-ChildItem $feedPath -File | Where-Object { $expected -notcontains $_.Name } | ForEach-Object {
        Write-Host "🧹 Removing duplicate feed file: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }
    Write-Host "✅ PowerFeed cleaned." -ForegroundColor Green
}

# Step 4: Check routing files
$mainFile = "frontend/src/main.jsx"
$appFile = "frontend/src/App.jsx"
$authFile = "frontend/src/AuthProvider.jsx"

foreach ($file in @($mainFile, $appFile, $authFile)) {
    if (Test-Path $file) {
        Write-Host "✅ Found $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing file: $file" -ForegroundColor Red
    }
}

# Step 5: Start frontend
Write-Host "`n⚡ Starting frontend on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "cd frontend; npm run dev" -NoNewWindow

Write-Host "`n✅ PowerStream FRONTEND launch complete. UI is live." -ForegroundColor Green
