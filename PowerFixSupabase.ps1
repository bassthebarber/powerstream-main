# PowerFixSupabase.ps1
# ✅ Validates Supabase client connection and .env.local configuration

Write-Host "`n🔐 PowerFix: Validating Supabase Environment Configuration..."

# Step 1: Check .env.local file
$envFile = ".env.local"
if (-Not (Test-Path $envFile)) {
    Write-Host "❌ ERROR: .env.local file is missing." -ForegroundColor Red
    exit 1
}

$envContent = Get-Content $envFile
if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
    Write-Host "✅ Supabase credentials found in .env.local"
} else {
    Write-Host "❌ Missing Supabase URL or Anon Key in .env.local" -ForegroundColor Red
    exit 1
}

# Step 2: Check supabaseClient.js exists
if (Test-Path "src\supabaseClient.js") {
    Write-Host "✅ supabaseClient.js found"
} else {
    Write-Host "❌ Missing supabaseClient.js in src/" -ForegroundColor Red
    exit 1
}

# Step 3: Verify VITE can access environment variables
Write-Host "`n🌐 Starting Vite to check Supabase injection..."

Start-Process powershell -ArgumentList "npm run dev" -NoNewWindow
Write-Host "🚀 Dev server starting on http://localhost:5173 — check browser DevTools for Supabase logs"
