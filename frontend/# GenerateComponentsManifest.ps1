# GenerateComponentsManifest.ps1
# Scans src/components and src/pages and creates components.json

Write-Host "🔍 Scanning components and pages..." -ForegroundColor Cyan

$root = "src"
$outputFile = "$root\components\components.json"

# Make sure components folder exists
if (-not (Test-Path "$root\components")) {
    New-Item -ItemType Directory -Force -Path "$root\components" | Out-Null
}

$manifest = @{
    app       = @{}
    feed      = @{}
    messaging = @{}
    media     = @{}
    tv        = @{}
    ui        = @{}
    ai        = @{}
}

# Add App and Main if they exist
if (Test-Path "$root\App.jsx") { $manifest.app.home = "./App.jsx" }
if (Test-Path "$root\main.jsx") { $manifest.app.main = "./main.jsx" }

# Scan pages
Get-ChildItem -Recurse "$root\pages" -Include *.jsx | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $name = $_.BaseName.ToLower()

    switch -Regex ($name) {
        "feed"     { $manifest.feed.powerfeed     = "./$relativePath" }
        "line"     { $manifest.messaging.powerline = "./$relativePath" }
        "gram"     { $manifest.media.powergram     = "./$relativePath" }
        "reel"     { $manifest.media.powerreel     = "./$relativePath" }
        "station"  { $manifest.tv[$name]           = "./$relativePath" }
        default    { }
    }
}

# Scan components
Get-ChildItem -Recurse "$root\components" -Include *.jsx | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $name = $_.BaseName.ToLower()

    switch -Regex ($name) {
        "header"   { $manifest.ui.header     = "./$relativePath" }
        "footer"   { $manifest.ui.footer     = "./$relativePath" }
        "navbar"   { $manifest.ui.navbar     = "./$relativePath" }
        "copilot"  { $manifest.ai.copilot    = "./$relativePath" }
        "hud"      { $manifest.ai.hud        = "./$relativePath" }
        "logic"    { $manifest.ai.logicengine = "./$relativePath" }
        default    { }
    }
}

# Convert to JSON and save
$manifest | ConvertTo-Json -Depth 5 | Set-Content $outputFile -Encoding UTF8

Write-Host "✅ components.json generated at $outputFile" -ForegroundColor Green
