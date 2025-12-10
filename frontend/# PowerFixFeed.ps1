all 3 files# PowerFixFeed.ps1
# ✅ PowerStream Feed Auto-Fix Script by ChatGPT
# Fixes import paths, creates missing files, and restarts Vite server

Write-Host "🔧 PowerFixFeed.ps1 starting..." -ForegroundColor Cyan

# Set working directory to frontend
Set-Location -Path ".\frontend"

# 1. Fix Feed.jsx import paths
$feedPath = ".\src\pages\feed\Feed.jsx"
if (Test-Path $feedPath) {
    (Get-Content $feedPath) |
    ForEach-Object {
        $_ -replace "../components/StoryBoard", "../../components/StoryBoard" `
           -replace "../components/FeedComposer", "../../components/FeedComposer" `
           -replace "../components/PostCard", "../../components/PostCard" `
           -replace "../hooks/usePost", "../../hooks/usePost"
    } | Set-Content $feedPath
    Write-Host "✅ Fixed Feed.jsx import paths"
} else {
    Write-Host "⚠️ Feed.jsx not found. Skipping." -ForegroundColor Yellow
}

# 2. Fix usePost.js import to supabaseClient
$usePostPath = ".\src\hooks\usePost.js"
if (Test-Path $usePostPath) {
    (Get-Content $usePostPath) |
    ForEach-Object {
        $_ -replace "../../supabaseClient", "../services/supabaseClient"
    } | Set-Content $usePostPath
    Write-Host "✅ Fixed usePost.js Supabase import"
} else {
    Write-Host "⚠️ usePost.js not found. Skipping." -ForegroundColor Yellow
}

# 3. Create StoryBoard.jsx if missing
$storyBoardPath = ".\src\components\StoryBoard.jsx"
if (-not (Test-Path $storyBoardPath)) {
    @"
import React from 'react';
import './StoryBoard.css';

export default function StoryBoard() {
  const stories = ['Ayana', 'Mike', 'Felicia', 'Brooklyn'];

  return (
    <div className="story-board">
      {stories.map((name, i) => (
        <div className="story" key={i}>
          <div className="avatar">{name[0]}</div>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}
"@ | Set-Content $storyBoardPath
    Write-Host "✅ Created StoryBoard.jsx"
}

# 4. Create StoryBoard.css if missing
$storyBoardCSSPath = ".\src\components\StoryBoard.css"
if (-not (Test-Path $storyBoardCSSPath)) {
    @"
.story-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px;
  background: #f0f0f0;
}
.story {
  text-align: center;
  min-width: 60px;
}
.avatar {
  width: 50px;
  height: 50px;
  background: #222;
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
}
"@ | Set-Content $storyBoardCSSPath
    Write-Host "✅ Created StoryBoard.css"
}

# 5. Confirm Supabase client exists
$supabaseClientPath = ".\src\services\supabaseClient.js"
if (-not (Test-Path $supabaseClientPath)) {
    Write-Host "⚠️ Missing supabaseClient.js in /services/. Please create it manually!" -ForegroundColor Red
} else {
    Write-Host "✅ Supabase client found"
}

# 6. Restart Vite (kill and run)
Write-Host "🚀 Restarting Vite Dev Server..."
Start-Process "cmd.exe" "/c npm run dev" -NoNewWindow
Write-Host "✅ Done. Frontend is launching..." -ForegroundColor Green
