# PowerFixMobile.ps1
Write-Host "🔧 PowerFixMobile.ps1 initiated..."

# Set execution context
Set-Location -Path $PSScriptRoot

# Step 1: Create PowerRebuild.json
$rebuildPath = "frontend/PowerRebuild.json"
$rebuildData = @{
    "intent" = "REBUILD_UI_MOBILE"
    "targets" = @("Feed", "Gram", "Reel", "PowerLine", "Stations")
    "triggeredBy" = "PowerFixMobile"
    "copilot" = "true"
} | ConvertTo-Json -Depth 3
$rebuildData | Out-File -FilePath $rebuildPath -Encoding utf8
Write-Host "✅ PowerRebuild.json created at $rebuildPath"

# Step 2: Validate supabaseClient export
$supabasePath = "frontend/src/lib/supabaseClient.js"
if (Test-Path $supabasePath) {
    $content = Get-Content $supabasePath -Raw
    if ($content -notmatch "export\s+default\s+createClient") {
        Write-Host "⚠️ Fixing export in supabaseClient.js..."
        Set-Content $supabasePath 'import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default supabase;'
        Write-Host "✅ Export default fixed."
    } else {
        Write-Host "✅ Supabase client export is already valid."
    }
} else {
    Write-Host "❌ supabaseClient.js not found at $supabasePath"
}

# Step 3: Launch frontend
Write-Host "🚀 Launching frontend..."
Start-Process "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend"

Write-Host "✅ PowerFixMobile.ps1 complete."
