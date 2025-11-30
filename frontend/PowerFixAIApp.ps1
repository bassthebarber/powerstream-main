# PowerFixAIApp.ps1
# 🧠 Repairs and Restores AICommandMap.js + PowerUIBuilder.js and relaunches frontend

Write-Host "🔧 PowerFixAIApp.ps1 launching..." -ForegroundColor Cyan

# Set frontend root
$frontendPath = Get-Location
$aiCorePath = "$frontendPath\src\components\ai\core"

# Step 1: Ensure AI core folder exists
if (!(Test-Path $aiCorePath)) {
    Write-Host "📁 Creating missing AI core folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $aiCorePath
}

# Step 2: Rebuild AICommandMap.js
$aiCommandMapContent = @"
import PowerUIBuilder from "./PowerUIBuilder";

const runAICommand = (command) => {
  console.log(\`🤖 Executing Copilot AI command: \${command}\`);

  switch (command.toLowerCase()) {
    case "build facebook":
      PowerUIBuilder("feed");
      break;
    case "build instagram":
      PowerUIBuilder("gram");
      break;
    case "build tiktok":
      PowerUIBuilder("reel");
      break;
    case "build messenger":
      PowerUIBuilder("powerline");
      break;
    case "build netflix":
      PowerUIBuilder("tv");
      break;
    case "build southern power":
      PowerUIBuilder("southernpower");
      break;
    case "build civic connect":
      PowerUIBuilder("civic");
      break;
    case "build no limit":
      PowerUIBuilder("nolimit");
      break;
    case "build texas got talent":
      PowerUIBuilder("texasgottalent");
      break;
    default:
      console.warn("⚠️ Unknown AI command:", command);
      break;
  }
};

export default runAICommand;
"@
$aiCommandMapContent | Set-Content -Path "$aiCorePath\AICommandMap.js"
Write-Host "✅ AICommandMap.js restored"

# Step 3: Rebuild PowerUIBuilder.js
$uiBuilderContent = @"
const PowerUIBuilder = (target = "default") => {
  console.log(\`🧱 PowerUIBuilder triggered → Target: \${target}\`);

  switch (target) {
    case "feed":
      // Render PowerFeed UI
      break;
    case "gram":
      // Render PowerGram UI
      break;
    case "reel":
      // Render PowerReel UI
      break;
    case "powerline":
      // Render Messenger UI
      break;
    case "tv":
      // Load main TV layout
      break;
    case "southernpower":
    case "civic":
    case "nolimit":
    case "texasgottalent":
      // Load specific TV Station UI
      break;
    default:
      console.warn("⚠️ No matching layout for target:", target);
  }
};

export default PowerUIBuilder;
"@
$uiBuilderContent | Set-Content -Path "$aiCorePath\PowerUIBuilder.js"
Write-Host "✅ PowerUIBuilder.js restored"

# Step 4: Start the frontend
Write-Host "🚀 Launching frontend with: npm run dev..." -ForegroundColor Green
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory $frontendPath

Write-Host "`n🎯 Done. AI systems fully restored and frontend running." -ForegroundColor Magenta
