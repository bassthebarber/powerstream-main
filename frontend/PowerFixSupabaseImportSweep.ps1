# PowerFixSupabaseImportSweep.ps1
# 📦 Auto-corrects all Supabase import paths across your frontend project

Write-Host "`n🧠 PowerFix Supabase Import Sweep Started..."

# Set scan root
$scanPath = "src"
$pattern = "supabaseClient"

# Get all .js and .jsx files
$files = Get-ChildItem -Path $scanPath -Recurse -Include *.js, *.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Detect bad import path formats
    if ($content -match "from ['""](\.\/|\.\.\/)+supabaseClient(\.js)?['""]") {
        Write-Host "🔧 Fixing import in: $($file.FullName)"

        # Replace all patterns with correct relative path
        $fixed = $content -replace "from ['""](\.\/|\.\.\/)+supabaseClient(\.js)?['""]", "from '../../supabaseClient'"

        # Overwrite file
        Set-Content $file.FullName $fixed
    }
}

Write-Host "`n✅ Supabase imports cleaned and fixed across project."
Write-Host "🚀 You may now run: npm run dev"
