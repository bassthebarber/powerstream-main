# PowerRepairFrontend.ps1
# Full repair script: rename JSX files, fix imports, and clean duplicates
# Logs all changes to PowerRepairFrontend.log

Write-Host "🚀 Starting PowerRepairFrontend..." -ForegroundColor Cyan
$logFile = "PowerRepairFrontend.log"
if (Test-Path $logFile) { Remove-Item $logFile } # clear old log

# Step 1: Rename .js files that contain JSX into .jsx
Get-ChildItem -Recurse -Path "src" -Filter *.js | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "<[a-zA-Z]") {
        $newName = ($_.FullName -replace '\.js$', '.jsx')
        Rename-Item -Path $_.FullName -NewName $newName -Force
        $msg = "🔄 Renamed $($_.Name) → $(Split-Path $newName -Leaf)"
        Write-Host $msg
        Add-Content $logFile $msg
    }
}

# Step 2: Fix imports inside src/
Get-ChildItem -Recurse -Path "src" -Include *.js,*.jsx | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw

    # Regex replacements (PowerShell-safe)
    $newContent = $content -replace "(\.\/[^\s'\""]+)\.js(['\""])", '$1.jsx$2'
    $newContent = $newContent -replace "(\.\.[^\s'\""]+)\.js(['\""])", '$1.jsx$2'

    if ($newContent -ne $content) {
        Set-Content $path $newContent
        $msg = "✅ Fixed imports in $($_.FullName)"
        Write-Host $msg
        Add-Content $logFile $msg
    }
}

# Step 3: Remove duplicate .js if .jsx exists
Get-ChildItem -Recurse -Path "src" -Filter *.js | ForEach-Object {
    $jsxFile = ($_.FullName -replace '\.js$', '.jsx')
    if (Test-Path $jsxFile) {
        $msg = "❌ Removing duplicate $($_.FullName)"
        Remove-Item $_.FullName -Force
        Write-Host $msg
        Add-Content $logFile $msg
    }
}

Write-Host "🎉 PowerRepairFrontend complete! Log saved to $logFile" -ForegroundColor Green
Write-Host "👉 Restart your dev server with: pnpm dev"
