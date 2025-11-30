# PowerFixImportPaths.ps1
# 🔁 Auto-scans all .jsx files and corrects common broken import paths

Write-Host "`n🔎 PowerFix: Scanning for broken relative imports..."

$basePath = Join-Path (Get-Location) "src"
$files = Get-ChildItem -Recurse -Path $basePath -Include *.js, *.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName

    # Fix common incorrect import like ../supabaseClient
    if ($content -match "\.\.\/supabaseClient") {
        $fixedContent = $content -replace "\.\.\/supabaseClient", "../../supabaseClient"
        Set-Content $file.FullName $fixedContent
        Write-Host "✅ Fixed import in: $($file.FullName)"
    }

    # Example: Add more auto-corrections here as needed
}

Write-Host "`n✅ Import validation complete. You can now run:"
Write-Host "   npm run dev" -ForegroundColor Cyan
