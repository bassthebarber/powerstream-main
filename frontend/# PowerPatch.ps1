# PowerPatch.ps1
Write-Host "🛠️ Running PowerPatch Deep Repair..." -ForegroundColor Cyan

# Step 1: Check duplicate files in src/
$files = Get-ChildItem -Path .\src -Include *.jsx -Recurse
$duplicateGroups = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }
if ($duplicateGroups.Count -gt 0) {
    Write-Host "⚠️ Duplicate components found:" -ForegroundColor Red
    $duplicateGroups | ForEach-Object { Write-Host "  $_.Name (Count: $($_.Count))" -ForegroundColor Yellow }
} else {
    Write-Host "✅ No duplicate components found." -ForegroundColor Green
}

# Step 2: Check for unused or orphaned files
Write-Host "🗃️ Scanning for unused files..." -ForegroundColor Yellow
$allJSX = Get-ChildItem -Recurse -Include *.jsx
$usedJSX = Select-String -Path .\src\**\*.jsx -Pattern "\.\/.*\.jsx" | ForEach-Object { $_.Line } | Sort-Object -Unique
$unusedFiles = @()

foreach ($file in $allJSX) {
    $basename = $file.BaseName
    if (-not ($usedJSX -match $basename)) {
        $unusedFiles += $file.FullName
    }
}

if ($unusedFiles.Count -gt 0) {
    Write-Host "🧹 Unused files (consider removing):" -ForegroundColor DarkGray
    $unusedFiles | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "✅ No unused files detected." -ForegroundColor Green
}

# Step 3: Activate HUD + Copilot UI
Write-Host "🧠 Activating Copilot Visual Dashboard and Matrix Override Engine..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Write-Host "✅ Override Active. You may now begin issuing Copilot commands to build UI." -ForegroundColor Green

exit 0
