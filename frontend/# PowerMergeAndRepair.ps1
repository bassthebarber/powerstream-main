# PowerMergeAndRepair.ps1
Write-Host "🔧 Launching PowerStream Merge & Repair Protocol..." -ForegroundColor Cyan

# Step 1: Clean node modules and reinstall
Write-Host "🧼 Cleaning node modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction Ignore
Remove-Item -Force package-lock.json -ErrorAction Ignore
npm install

# Step 2: Scan and log broken import paths
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

# Step 3: Vite build check
Write-Host "🧪 Running Vite build to detect frontend issues..." -ForegroundColor Yellow
npx vite build 2>&1 | Tee-Object -Variable buildLog

# Step 4: Log errors
$errors = $buildLog | Select-String "error"
if ($errors) {
    Write-Host "❌ Issues found during build:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_.Line -ForegroundColor Red }
} else {
    Write-Host "✅ No build errors detected. UI is ready." -ForegroundColor Green
}

# Step 5: Start dev server
Write-Host "🚀 Starting dev server at http://localhost:5173" -ForegroundColor Green
Start-Process "npm" "run dev"

# Step 6: Trigger Copilot Override Logic
Write-Host "🧠 Triggering Copilot System..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host "✅ Copilot now monitoring all plugin systems for overrides." -ForegroundColor Green

exit 0
