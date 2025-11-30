# PowerFixFrontend.ps1
# Fixes frontend install, sets up Tailwind, and starts dev server

Write-Host "🚀 PowerFixFrontend starting..." -ForegroundColor Cyan

# 1. Go to frontend folder
$Frontend = "C:\Users\bassb\Documents\PowerStreamMain\frontend"
Set-Location $Frontend
Write-Host "📂 In frontend folder: $Frontend"

# 2. Clean broken installs
if (Test-Path "node_modules") {
    Write-Host "🧹 Removing node_modules..."
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Force "pnpm-lock.yaml"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# 3. Reinstall dependencies
Write-Host "📦 Reinstalling dependencies..."
pnpm install

# 4. Ensure UI libraries
Write-Host "🎨 Installing UI libs..."
pnpm add react-router-dom axios clsx tailwind-merge framer-motion lucide-react @radix-ui/react-slot jotai zustand zod react-hook-form @hookform/resolvers hls.js socket.io-client jwt-decode date-fns

# 5. Ensure Tailwind + PostCSS
Write-Host "🎛 Installing Tailwind..."
pnpm add -D tailwindcss postcss autoprefixer

# 6. Init Tailwind (only if config missing)
if (-not (Test-Path "tailwind.config.js")) {
    Write-Host "⚡ Creating Tailwind config..."
    npx tailwindcss init -p
}

# 7. Fix Tailwind content paths
(Get-Content "tailwind.config.js") -replace "content: \[\]", "content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}']" | Set-Content "tailwind.config.js"
Write-Host "✅ Tailwind config updated."

# 8. Ensure Tailwind directives in index.css
$indexCss = "src\index.css"
if (-not (Test-Path $indexCss)) { New-Item $indexCss -ItemType File | Out-Null }
$cssContent = Get-Content $indexCss -Raw
if ($cssContent -notmatch "@tailwind base") {
    "@tailwind base;`n@tailwind components;`n@tailwind utilities;" | Set-Content $indexCss
    Write-Host "✅ Tailwind directives injected into src/index.css"
}

# 9. Ensure dev scripts in package.json
$pkgPath = "package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.scripts.dev = "vite"
$pkg.scripts.build = "vite build"
$pkg.scripts.preview = "vite preview"
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath
Write-Host "✅ Scripts updated in package.json"

# 10. Start dev server
Write-Host "🚀 Starting dev server..."
pnpm dev
