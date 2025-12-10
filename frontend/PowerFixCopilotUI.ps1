# PowerFixCopilotUI.ps1
Write-Host "`n⚙️  Fixing CopilotCommandBar file and imports..."

# Set paths
$componentPath = "frontend\src\components\ai\CopilotCommandBar.js"
$componentPathNew = "frontend\src\components\ai\CopilotCommandBar.jsx"

# Rename file if exists
if (Test-Path $componentPath) {
    Rename-Item -Path $componentPath -NewName "CopilotCommandBar.jsx"
    Write-Host "✅ Renamed CopilotCommandBar.js → CopilotCommandBar.jsx"
} else {
    Write-Host "⚠️ CopilotCommandBar.js not found. Skipping rename."
}

# Update all .js imports to .jsx for that file
Write-Host "🔍 Updating import references..."
Get-ChildItem -Path "frontend\src" -Recurse -Include *.js, *.jsx | ForEach-Object {
    (Get-Content $_.FullName) -replace "CopilotCommandBar.js", "CopilotCommandBar.jsx" | Set-Content $_.FullName
}

Write-Host "✅ Imports updated to .jsx"

# Restart dev server (optional)
Write-Host "`n🔄 Restarting frontend server..."
cd frontend
Start-Process "npm" "run dev"

Write-Host "`n✅ All done. CopilotCommandBar should now compile without build error.`n"
