# =======================================
# PowerFixMobile.ps1
# Mobile UI Restoration + Copilot Trigger
# =======================================

# STEP 1: Fix supabaseClient.js export
$supabasePath = "frontend/src/lib/supabaseClient.js"
if (Test-Path $supabasePath) {
    $content = Get-Content $supabasePath -Raw
    if ($content -notmatch "export default") {
        $content = $content + "`nexport default supabase;"
        Set-Content -Path $supabasePath -Value $content -Force
        Write-Host "✅ Patched: supabaseClient.js export default added."
    } else {
        Write-Host "ℹ️ Already has export default."
    }
} else {
    Write-Host "❌ supabaseClient.js not found. Skipping export fix."
}

# STEP 2: Create mobile optimization Copilot trigger
$triggerPath = "frontend/src/ai/trigger"
$triggerFile = "$triggerPath/PowerRebuild.json"

if (-not (Test-Path $triggerPath)) {
    New-Item -ItemType Directory -Path $triggerPath -Force
}

@'
{
  "intent": "REBUILD_UI_MOBILE",
  "platform": "PowerStream",
  "branding": {
    "theme": "BlackGold",
    "mobileFriendly": true,
    "logo": "powerstream-logo.png"
  },
  "homepage": {
    "spinner": true,
    "voiceIntro": "welcome-voice.mp3",
    "responsiveGrid": true,
    "modules": ["PowerFeed", "PowerGram", "PowerReel", "PowerLine", "TVStations"]
  },
  "modules": {
    "PowerFeed": {
      "layout": "timeline",
      "storyRow": true,
      "bottomNav": true,
      "postComposer": true
    },
    "PowerGram": {
      "style": "Instagram",
      "gridMobile": true,
      "swipeNav": true
    },
    "PowerReel": {
      "style": "TikTok",
      "scroll": "vertical",
      "autoPlay": true,
      "coinTips": true
    },
    "PowerLine": {
      "style": "Messenger",
      "mobileCalls": true,
      "chatThreads": true,
      "dockBottom": true
    },
    "TVStations": {
      "SouthernPower": "Mobile stream + schedule + upload",
      "NoLimitEastHouston": "Tank-style UI on mobile",
      "CivicConnect": "Civic mobile HUD",
      "responsive": true
    }
  },
  "copilot": {
    "triggerOnLaunch": true,
    "mobileMode": true,
    "overrideRepair": true
  }
}
'@ | Out-File -FilePath $triggerFile -Encoding utf8 -Force

Write-Host "✅ PowerRebuild.json (Mobile) created."

# STEP 3: Launch frontend
Write-Host "🚀 Starting frontend (npm run dev)..."
Start-Process "npm" "run dev" -WorkingDirectory "frontend"
