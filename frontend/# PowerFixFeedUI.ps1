# PowerFixFeedUI.ps1
# Creates missing folders and placeholder files for Batch 2 (Stories) and Batch 3 (Social Layer)
# Author: ChatGPT for PowerStream

Write-Host "🚀 PowerFixFeedUI.ps1 Starting..."

# Set base path to where you're running the script (frontend root)
$basePath = Get-Location

# Define folders to create
$folders = @(
    "src/components/stories",
    "src/components/social",
    "src/components/notifications"
)

# Create folders
foreach ($folder in $folders) {
    $fullPath = Join-Path $basePath $folder
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath | Out-Null
        Write-Host "✅ Created folder: $folder"
    } else {
        Write-Host "⚠️ Folder already exists: $folder"
    }
}

# Define files and basic content
$files = @{
    "src/components/stories/StoryBarPro.jsx" = @"
import React from 'react';
import './Story.module.css';

export default function StoryBarPro() {
  return (
    <div className="storyBar">
      <div className="storyCircle create">+</div>
      {/* Render story circles */}
    </div>
  );
}
"@;

    "src/components/stories/StoryCard.jsx" = @"
import React from 'react';

export default function StoryCard({ story }) {
  return <div>{story.username}'s story</div>;
}
"@;

    "src/components/stories/StoryViewer.jsx" = @"
import React from 'react';

export default function StoryViewer({ story }) {
  return (
    <div className="storyViewer">
      <video src={story.mediaUrl} autoPlay controls />
    </div>
  );
}
"@;

    "src/components/stories/Story.module.css" = @"
.storyBar {
  display: flex;
  overflow-x: auto;
}
.storyCircle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: gray;
  margin: 0 8px;
}
.create {
  background: gold;
  color: black;
  font-weight: bold;
}
"@;

    "src/components/social/PeopleYouMayKnow.jsx" = @"
import React from 'react';
import './PeopleYouMayKnow.module.css';

export default function PeopleYouMayKnow() {
  const people = ['Marcus', 'Ayana', 'Keith', 'Bryce'];
  return (
    <div className="peopleBox">
      <h4>People You May Know</h4>
      <ul>
        {people.map(p => <li key={p}>{p}</li>)}
      </ul>
    </div>
  );
}
"@;

    "src/components/social/PeopleYouMayKnow.module.css" = @"
.peopleBox {
  padding: 10px;
  background: #1e1e1e;
  border-radius: 10px;
  color: white;
}
"@;

    "src/components/notifications/NotificationDropdown.jsx" = @"
import React from 'react';
import './Notifications.module.css';

export default function NotificationDropdown() {
  const notifications = ['New like on your post', 'Ayana commented on your video'];
  return (
    <div className="notificationDropdown">
      <h4>Notifications</h4>
      <ul>
        {notifications.map((n, i) => <li key={i}>{n}</li>)}
      </ul>
    </div>
  );
}
"@;

    "src/components/notifications/Notifications.module.css" = @"
.notificationDropdown {
  position: absolute;
  right: 0;
  top: 50px;
  background: black;
  color: white;
  padding: 12px;
  width: 250px;
  border-radius: 8px;
}
"@
}

# Create files with content
foreach ($filePath in $files.Keys) {
    $fullFilePath = Join-Path $basePath $filePath
    if (-not (Test-Path $fullFilePath)) {
        $dir = Split-Path $fullFilePath
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        $files[$filePath] | Out-File -FilePath $fullFilePath -Encoding UTF8
        Write-Host "📝 Created file: $filePath"
    } else {
        Write-Host "⚠️ File already exists: $filePath"
    }
}

Write-Host "`n✅ PowerFixFeedUI.ps1 complete — Batch 2 and 3 are installed."
