Write-Host "🔧 Installing PowerGallery components..."

$folders = @(
  "frontend/src/components/feed",
  "frontend/src/components/gram",
  "frontend/src/components/reel",
  "frontend/src/styles"
)

foreach ($folder in $folders) {
  if (!(Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder | Out-Null
  }
}

Write-Host "📂 Folder structure verified."
Write-Host "🖼️ Gallery components ready. Paste JSX files into respective folders."
Write-Host "✅ Run your Vite dev server: `npm run dev`"
Write-Host "🚨 Make sure Supabase buckets are named: feed-gallery, gram-gallery, reel-gallery"
Write-Host "🎯 Project ready for upload, display, and auto-scaling."
