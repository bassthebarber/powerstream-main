$rootPath = "C:\Users\bassb\OneDrive\Documents\PowerStreamMain\frontend\src"
$jsxFiles = Get-ChildItem -Path $rootPath -Recurse -Include *.jsx,*.js

foreach ($file in $jsxFiles) {
    Write-Host "`n📄 Checking: $($file.FullName)"
    $content = Get-Content $file.FullName
    foreach ($line in $content) {
        if ($line -match 'import .* from [\'"](.*)[\'"]') {
            $importPath = $matches[1]
            if ($importPath.StartsWith(".")) {
                $resolved = Resolve-Path -Path "$($file.DirectoryName)\$importPath*" -ErrorAction SilentlyContinue
                if (-not $resolved) {
                    Write-Host "❌ Broken import: $importPath in $($file.Name)" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "`n✅ Validation complete. Review errors above." -ForegroundColor Green
