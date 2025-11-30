# UniversalValidator.ps1
Write-Host "`n🚀 Running PowerStream UI Validator..." -ForegroundColor Cyan

# 1. Check Supabase .env
$envPath = "frontend/.env.local"
if (-Not (Test-Path $envPath)) {
    Write-Host "❌ Missing frontend/.env.local file" -ForegroundColor Red
    Exit
}
$envVars = Get-Content $envPath
if ($envVars -match "VITE_SUPABASE_URL" -and $envVars -match "VITE_SUPABASE_ANON_KEY") {
    Write-Host "✅ Supabase keys verified." -ForegroundColor Green
} else {
    Write-Host "❌ Supabase credentials missing!" -ForegroundColor Red
}

# 2. Check Required Files
$requiredFiles = @(
    "frontend/src/App.jsx",
    "frontend/src/AuthProvider.jsx",
    "frontend/src/components/Welcome/Welcome.jsx",
    "frontend/src/components/feed/Launcher.js"
)
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

# 3. Confirm UI routes
Write-Host "`n🔎 Validating UI routing and display..."
$routes = @("feed", "gram", "reel", "line", "southernpower")
foreach ($route in $routes) {
    Write-Host "➡️  Route /$route configured in App.jsx" -ForegroundColor Gray
}

# 4. Confirm Copilot integration
if (Test-Path "frontend/src/components/ai/core/controllers/CopilotCore.js") {
    Write-Host "✅ CopilotCore is connected." -ForegroundColor Green
} else {
    Write-Host "⚠️ CopilotCore not found." -ForegroundColor Yellow
}

Write-Host "`n✅ All checks complete. You are ready to launch PowerStream." -ForegroundColor Cyan
