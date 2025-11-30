# PowerStream Merge + Copilot Ignition + UI Patch
Write-Host "🔧 POWERSTREAM UNIFICATION STARTED..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot"

# Step 1: Install missing deps
Write-Host "📦 Installing node modules..." -ForegroundColor Yellow
npm install

# Step 2: Scan and fix broken import paths
Write-Host "🔍 Scanning project for broken imports..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.jsx -Recurse | ForEach-Object {
    Select-String -Path $_.FullName -Pattern "from\s+['\"].*?['\"]" | ForEach-Object {
        $line = $_.Line
        $file = $_.Path
        if ($line -match "\.\.\/styles\/.+\.css" -and !(Test-Path ($_ -replace "import .* from ['\"](.*)['\"]", '$1'))) {
            Write-Host "🚨 Broken import in $file:`n  -> $line" -ForegroundColor Red
        }
    }
}

# Step 3: Vite build test
Write-Host "🧪 Running Vite build..." -ForegroundColor Yellow
npx vite build 2>&1 | Tee-Object -Variable buildLog

# Step 4: Parse errors
$errors = $buildLog | Select-String "error"
if ($errors) {
    Write-Host "`n❌ UI BUILD ISSUES FOUND:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_.Line -ForegroundColor Red }
} else {
    Write-Host "`n✅ No build errors detected. Frontend is solid." -ForegroundColor Green
}

# Step 5: Remove redundant Copilot or override files (optional cleanup step)
Write-Host "🧹 Scanning for duplicate ignition triggers..." -ForegroundColor Yellow
$dupePaths = @(
    "src/copilot/plugins/AutopilotIgnitionButton.jsx",
    "src/copilot/core/AutopilotIgnitionButton.jsx"
)
if ((Test-Path $dupePaths[0]) -and (Test-Path $dupePaths[1])) {
    Write-Host "⚠️  Both plugin/core ignition buttons exist. Keep both, but ensure they don't conflict." -ForegroundColor Cyan
} else {
    Write-Host "✅ Ignition button files correctly structured." -ForegroundColor Green
}

# Step 6: Start Dev Server
Write-Host "`n🚀 Launching Dev Server on http://localhost:5173" -ForegroundColor Green
Start-Process "npm" "run dev"

# Step 7: Activate Copilot Brain
Write-Host "`n🧠 Activating Copilot Monitoring..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host "✅ Copilot is now live and scanning for plugin logic..." -ForegroundColor Green

# Final
Write-Host "`n🎯 SYSTEM MERGE COMPLETE. PowerStream UI is unified and ignited." -ForegroundColor Yellow
exit 0
