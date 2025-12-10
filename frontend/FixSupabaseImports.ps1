Write-Host "🔧 Running PowerStream Supabase Import Fix..." -ForegroundColor Cyan

$frontendPath = "frontend/src"

# Track fixed files
$fixedFiles = @()

Get-ChildItem -Path $frontendPath -Recurse -Include *.js, *.jsx | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file

    # Fix import { supabase } -> import supabase
    if ($content -match "import\s+\{\s*supabase\s*\}\s+from\s+['\"].*/supabaseClient.js['\"]") {
        Write-Host "⚡ Fixing: $file" -ForegroundColor Yellow
        $fixed = $content -replace "import\s+\{\s*supabase\s*\}\s+from\s+(['\"].*/supabaseClient.js['\"])", "import supabase from $1"
        Set-Content -Path $file -Value $fixed -Encoding UTF8
        $fixedFiles += $file
    }
}

if ($fixedFiles.Count -gt 0) {
    Write-Host "`n✅ Fixed imports in these files:" -ForegroundColor Green
    $fixedFiles | ForEach-Object { Write-Host $_ -ForegroundColor Cyan }
} else {
    Write-Host "`n👍 No bad imports found." -ForegroundColor Green
}
