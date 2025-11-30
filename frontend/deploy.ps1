# ============================
# PowerStream Frontend Deployer
# ============================
# Run from your Windows PowerShell, inside: PowerStreamMain\frontend
# Usage:  .\deploy.ps1

$ErrorActionPreference = "Stop"

# ---- EDIT IF NEEDED ----
$DropletUser = "root"
$DropletHost = "104.248.73.68"
$RemoteAppDir    = "/var/www/powerstream/frontend/build"
$RemoteStudioDir = "/var/www/studio/frontend/build"
# ------------------------

function Say($msg) { Write-Host "[$(Get-Date -Format HH:mm:ss)] $msg" -ForegroundColor Cyan }

# 0) Ensure we are in the frontend folder
$here = Split-Path -Leaf (Get-Location)
if ($here -notin @("frontend","Frontend")) {
  Say "Please cd into your 'PowerStreamMain\frontend' folder, then run:  .\deploy.ps1"
  exit 1
}

# 1) Build
Say "Installing deps (if package-lock exists) and building…"
if (Test-Path "package-lock.json") { npm ci }
else { npm install }
npm run build

# 2) Verify build
if (!(Test-Path "build/index.html")) {
  Write-Error "Build folder not found. Expected .\build\index.html"
  exit 1
}
Say "Build complete."

# 3) Pack build into a tarball (more reliable than 'scp -r build/*' on Windows)
$TarName = "powerstream_build.tar.gz"
if (Test-Path $TarName) { Remove-Item $TarName -Force }
tar -czf $TarName -C build .

if (!(Test-Path $TarName)) {
  Write-Error "Failed to create $TarName"
  exit 1
}
Say "Packaged build as $TarName."

# 4) Upload tarball to the Droplet
$RemoteTmp = "/root/$TarName"
Say "Uploading to $DropletHost:$RemoteTmp …"
scp $TarName "$DropletUser@$DropletHost:$RemoteTmp"

# 5) SSH into the Droplet to deploy to both vhosts and reload nginx
$remoteScript = @"
set -e

echo "==> Creating target directories (if missing)…"
mkdir -p $RemoteAppDir
mkdir -p $RemoteStudioDir

echo "==> Clearing old files…"
# Keep the folder but wipe its contents
find $RemoteAppDir -mindepth 1 -delete || true
find $RemoteStudioDir -mindepth 1 -delete || true

echo "==> Unpacking build to both sites…"
tar -xzf $RemoteTmp -C $RemoteAppDir
tar -xzf $RemoteTmp -C $RemoteStudioDir

echo "==> Permissions to nginx user…"
chown -R www-data:www-data $RemoteAppDir $RemoteStudioDir
find $RemoteAppDir    -type d -exec chmod 755 {} \;
find $RemoteAppDir    -type f -exec chmod 644 {} \;
find $RemoteStudioDir -type d -exec chmod 755 {} \;
find $RemoteStudioDir -type f -exec chmod 644 {} \;

echo "==> Test & reload nginx…"
nginx -t
systemctl reload nginx

echo "==> Clean up…"
rm -f $RemoteTmp

echo "==> Done. Check:"
echo "   - http://southernpowertvmusic.com"
echo "   - http://studio.southernpowertvmusic.com"
"@

Say "Deploying on the server…"
ssh "$DropletUser@$DropletHost" "$remoteScript"

Say "✅ Deployment finished."
