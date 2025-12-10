# PowerFixAlt.ps1
# Validates and restarts PowerStream Alt components including Supabase auth, login UI, session manager

Write-Host "🔐 PowerFixAlt: Validating Supabase Auth and Alt components..."

# Clear Vite and Node cache
Remove-Item -Recurse -Force .vite, dist, .next -ErrorAction SilentlyContinue
Write-Host "✅ Cleared Vite and cache files."

# Reinstall frontend packages if needed
npm install
Write-Host "📦 Dependencies installed."

# Check for required files
$requiredFiles = @(
  "src/supabaseClient.js",
  "src/components/Auth/Auth.jsx",
  "src/components/Auth/RequireAuth.jsx",
  "src/components/Header.jsx",
  ".env.local"
)

foreach ($file in $requiredFiles) {
  if (Test-Path $file) {
    Write-Host "✅ Found: $file"
  } else {
    Write-Host "❌ MISSING: $file"
  }
}

# Launch frontend
Start-Process powershell -ArgumentList "npm run dev" -NoNewWindow
Write-Host "🚀 PowerStream Alt frontend launching at http://localhost:5173"
