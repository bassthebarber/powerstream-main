# PowerStream Studio & PowerHarmony API Wiring Documentation

## Overview

All Studio and PowerHarmony pages are now wired to backend APIs. The system uses a unified `studioApi.js` client that connects to the Recording Studio server (port 5100).

---

## API Client

**File**: `frontend/src/lib/studioApi.js`

- Base URL: `http://localhost:5100/api` (or `VITE_STUDIO_API_URL`)
- Automatically attaches JWT token from `localStorage`
- Handles 401 errors by clearing token
- Provides typed functions for all studio operations

---

## Endpoints & UI Wiring

### 🎹 Beat Lab (`/studio/beat-store`)

**Page**: `frontend/src/pages/studio/StudioBeatPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| "Generate (Prompt → Pattern)" button | `POST /api/beatlab/generate` | `generateBeat()` |
| "Render Loop" button | `POST /api/beatlab/generate` | `renderLoop()` |
| "Evolve Loop" button | `POST /api/beatlab/evolve` | `evolveLoop()` |
| "Save" button | `POST /api/beatlab/save` | `saveBeat()` |

**Request Payload** (Generate):
```json
{
  "prompt": "futuristic afrobeats with electric guitar",
  "temperature": 0.7,
  "bpm": 96,
  "style": "trap"
}
```

**Response**:
```json
{
  "ok": true,
  "beatId": "abc123",
  "audioUrl": "https://.../beat.mp3",
  "bpm": 96,
  "key": "C minor",
  "mood": "dark",
  "style": "trap",
  "suggestionText": "Generated dark trap beat at 96 BPM"
}
```

---

### 🎚️ Mix & Master (`/studio/mix`)

**Page**: `frontend/src/pages/studio/StudioMixPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| Sliders (Bass/Mid/Treble/Presence/Comp/Limiter) | State only | Updates React state |
| "Ask AI for Recipe" button | `POST /api/mix/ai-recipe` | `getAIRecipe()` |
| "Apply Mix" button | `POST /api/mix/apply` | `applyMix()` |
| "Download Master" button | Uses `mixResult.previewUrl` | Opens audio URL |

**Request Payload** (Apply Mix):
```json
{
  "trackId": "track123",
  "settings": {
    "bass": 4,
    "mid": 1,
    "treble": 3,
    "presence": 2,
    "comp": -3,
    "limiter": -1
  }
}
```

**Response**:
```json
{
  "ok": true,
  "mixId": "mix123",
  "previewUrl": "https://.../mix.mp3",
  "notes": "Mix applied successfully",
  "settings": { ... }
}
```

---

### 📤 Export & Email (`/studio/export-email`)

**Page**: `frontend/src/pages/studio/StudioExportPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| "Export" button | `POST /api/studio/export` | `exportProject()` |
| Email recipients | `POST /api/export/email` | `sendExportEmail()` |
| "Send to PowerStream" checkbox | `POST /api/ps-tv/titles` | Creates PS TV entry |

**Request Payload** (Export):
```json
{
  "projectId": "project123",
  "mixId": "mix123",
  "format": "mp3",
  "version": "clean",
  "sendToPowerStream": true
}
```

**Response**:
```json
{
  "ok": true,
  "exportId": "export123",
  "downloadUrl": "https://.../export.mp3",
  "format": "mp3",
  "version": "clean",
  "sentToPowerStream": true
}
```

---

### 📚 Library (`/studio/library`)

**Page**: `frontend/src/pages/studio/StudioLibraryPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| Filter buttons (All/Beats/Recordings/Masters) | `GET /api/library/all` | `getLibrary()` |
| Auto-loads on mount | `GET /api/library/all` | `getLibrary()` |

**Request**:
```
GET /api/library/all?type=beat&limit=50
```

**Response**:
```json
{
  "ok": true,
  "items": [
    {
      "_id": "item123",
      "name": "My Beat",
      "type": "beat",
      "url": "https://.../beat.mp3",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "counts": {
    "recordings": 10,
    "beats": 25,
    "mixes": 5
  }
}
```

---

### 💰 Royalty (`/studio/royalty`)

**Page**: `frontend/src/pages/studio/StudioRoyaltyPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| Split sliders/inputs | State only | Updates React state |
| "Save Splits" button | `POST /api/royalty/splits` | `saveRoyaltySplits()` |
| "View Statements" | `GET /api/royalty/statements` | `getRoyaltyStatements()` |

**Request Payload** (Save Splits):
```json
{
  "projectId": "project123",
  "participants": [
    { "name": "Producer", "percentage": 50 },
    { "name": "Artist", "percentage": 30 },
    { "name": "Writer", "percentage": 20 }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "splitId": "split123",
  "message": "Splits saved successfully"
}
```

---

### 📤 Upload (`/studio/upload`)

**Page**: `frontend/src/pages/studio/StudioUploadsPage.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| File input | N/A | Selects files |
| "Upload Files" button | `POST /api/upload/file` or `/api/upload/multi` | `uploadFile()` or `uploadFiles()` |

**Request**: `multipart/form-data` with `file` or `files` field

**Response**:
```json
{
  "ok": true,
  "asset": {
    "url": "https://.../file.mp3",
    "public_id": "file123",
    "resource_type": "video",
    "format": "mp3",
    "bytes": 1234567,
    "duration": 180
  }
}
```

---

### 🎙️ PowerHarmony Rooms

#### Write (`/powerharmony/write`)

**Page**: `frontend/src/pages/powerharmony/Write.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| "Generate Lyrics" button | `POST /api/studio/lyrics/generate` | `generateLyrics()` |
| "Save to Library" button | `POST /api/studio/session/save` | `saveSession()` |

**Request Payload**:
```json
{
  "prompt": "dark trap vibes about success",
  "style": "hip-hop",
  "mood": "uplifting"
}
```

**Response**:
```json
{
  "ok": true,
  "lyrics": "Verse 1:\n...",
  "prompt": "...",
  "style": "hip-hop",
  "mood": "uplifting"
}
```

#### Live (`/powerharmony/live`)

**Page**: `frontend/src/pages/powerharmony/Live.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| "RECORD" button | `POST /api/studio/record/start` | `startRecording()` |
| "STOP" button | `POST /api/studio/record/stop` | `stopRecording()` |
| "Export Recording" button | Uses `recordingUrl` | Opens audio URL |
| "Save to Library" button | `POST /api/studio/session/save` | `saveSession()` |

**Request Payload** (Start):
```json
{
  "room": "live",
  "projectId": "project123"
}
```

**Response**:
```json
{
  "ok": true,
  "sessionId": "record123",
  "status": "recording",
  "startedAt": "2024-01-01T00:00:00Z"
}
```

#### Mix (`/powerharmony/mix`)

**Page**: `frontend/src/pages/powerharmony/Mix.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| EQ sliders | State only | Updates React state |
| "Ask AI for Mix Suggestions" | `POST /api/mix/ai-recipe` | `getAIRecipe()` |
| "Apply Mix" button | `POST /api/mix/apply` | `applyMix()` |

#### Mastering (`/powerharmony/mastering`)

**Page**: `frontend/src/pages/powerharmony/Mastering.jsx`

| UI Element | Endpoint | Function |
|------------|----------|----------|
| Mastering sliders | State only | Updates React state |
| "Apply Master" button | `POST /api/studio/master/apply` | `applyMastering()` |

**Request Payload**:
```json
{
  "settings": {
    "loudness": -14,
    "stereoWidth": 50
  }
}
```

**Response**:
```json
{
  "ok": true,
  "masterId": "master123",
  "masterUrl": "https://.../master.mp3",
  "settings": { ... }
}
```

---

## Backend Routes Summary

### Recording Studio Server (Port 5100)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/beatlab/generate` | POST | Generate AI beat |
| `/api/beatlab/save` | POST | Save beat to library |
| `/api/beatlab/evolve` | POST | Evolve/mutate existing beat |
| `/api/mix/apply` | POST | Apply mix settings |
| `/api/mix/ai-recipe` | POST | Get AI mix recipe |
| `/api/studio/export` | POST | Export project |
| `/api/export/email` | POST | Send export via email |
| `/api/upload/file` | POST | Upload single file |
| `/api/upload/multi` | POST | Upload multiple files |
| `/api/library/all` | GET | Get all library items |
| `/api/library/beats` | GET | Get beats |
| `/api/library/recordings` | GET | Get recordings |
| `/api/library/mixes` | GET | Get mixes |
| `/api/royalty/splits` | POST | Save royalty splits |
| `/api/royalty/statements` | GET | Get royalty statements |
| `/api/studio/session/save` | POST | Save session/project |
| `/api/studio/session/:id` | GET | Load session |
| `/api/studio/sessions` | GET | List sessions |
| `/api/studio/record/start` | POST | Start recording |
| `/api/studio/record/stop` | POST | Stop recording |
| `/api/studio/lyrics/generate` | POST | Generate AI lyrics |
| `/api/studio/master/apply` | POST | Apply mastering |

---

## Error Handling

All API calls include:
- Try/catch blocks
- Error messages displayed to user
- Loading states during requests
- Disabled buttons during loading
- Graceful fallbacks

---

## Authentication

All requests automatically include:
```
Authorization: Bearer <token>
```

Token is retrieved from `localStorage.getItem("powerstream_token")` via `getToken()` utility.

---

## Example Payloads & Responses

### Beat Render
**Request**:
```json
{
  "bpm": 96,
  "bars": 2,
  "genres": ["Trap", "Drill"]
}
```

**Response**:
```json
{
  "ok": true,
  "beatId": "beat_1234567890",
  "audioUrl": "https://res.cloudinary.com/.../beat.mp3",
  "bpm": 96,
  "key": "C minor",
  "mood": "dark",
  "style": "trap"
}
```

### Mix/Recipe
**Request**:
```json
{
  "trackId": "track123",
  "prompt": "Master brighter, +1 dB loudness"
}
```

**Response**:
```json
{
  "ok": true,
  "mixId": "mix_1234567890",
  "previewUrl": "https://res.cloudinary.com/.../mix.mp3",
  "notes": "Master brighter, +1 dB loudness, tame 300Hz mud",
  "settings": {
    "bass": 4,
    "mid": 1,
    "treble": 3,
    "presence": 2,
    "comp": -3,
    "limiter": -1
  }
}
```

### Export
**Request**:
```json
{
  "projectId": "project123",
  "format": "mp3",
  "version": "clean",
  "sendToPowerStream": true
}
```

**Response**:
```json
{
  "ok": true,
  "exportId": "export_1234567890",
  "downloadUrl": "https://res.cloudinary.com/.../export.mp3",
  "format": "mp3",
  "version": "clean",
  "sentToPowerStream": true
}
```

### Library Fetch
**Request**:
```
GET /api/library/all?type=beat&limit=50
```

**Response**:
```json
{
  "ok": true,
  "items": [
    {
      "_id": "beat123",
      "name": "My Beat",
      "type": "beat",
      "url": "https://.../beat.mp3",
      "bpm": 96,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "counts": {
    "recordings": 10,
    "beats": 25,
    "mixes": 5
  }
}
```

### Royalty Splits
**Request**:
```json
{
  "projectId": "project123",
  "participants": [
    { "name": "Producer", "percentage": 50 },
    { "name": "Artist", "percentage": 30 },
    { "name": "Writer", "percentage": 20 }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "splitId": "split_1234567890",
  "message": "Splits saved successfully"
}
```

### PowerHarmony Actions

**Lyrics Generate**:
```json
{
  "prompt": "dark trap vibes",
  "style": "hip-hop",
  "mood": "uplifting"
}
```

**Recording Start**:
```json
{
  "room": "live",
  "projectId": "project123"
}
```

**Mastering Apply**:
```json
{
  "settings": {
    "loudness": -14,
    "stereoWidth": 50
  }
}
```

---

## Files Changed/Created

### Backend
- `backend/recordingStudio/routes/studioSessionRoutes.js` (NEW)
- `backend/recordingStudio/routes/studioMixRoutes.js` (NEW)
- `backend/recordingStudio/routes/studioRecordRoutes.js` (NEW)
- `backend/recordingStudio/routes/studioLyricsRoutes.js` (NEW)
- `backend/recordingStudio/routes/studioMasterRoutes.js` (NEW)
- `backend/recordingStudio/models/StudioSession.js` (NEW)
- `backend/recordingStudio/routes/beatLabRoutes.js` (UPDATED - added save/evolve)
- `backend/recordingStudio/routes/studioRoutes.js` (UPDATED - added export)
- `backend/recordingStudio/routes/royaltyRoutes.js` (UPDATED - added statements)
- `backend/recordingStudio/RecordingStudioServer.js` (UPDATED - mounted new routes)

### Frontend
- `frontend/src/lib/studioApi.js` (NEW - unified API client)
- `frontend/src/pages/studio/StudioBeatPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/studio/StudioMixPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/studio/StudioExportPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/studio/StudioLibraryPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/studio/StudioRoyaltyPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/studio/StudioUploadsPage.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/powerharmony/Write.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/powerharmony/Live.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/powerharmony/Mix.jsx` (UPDATED - wired to APIs)
- `frontend/src/pages/powerharmony/Mastering.jsx` (UPDATED - wired to APIs)

---

## Status

✅ **ALL MAJOR BUTTONS WIRED**

- Beat Lab: Generate, Render, Evolve, Save
- Mix & Master: AI Recipe, Apply Mix, Download
- Export: Export, Email, Send to PowerStream
- Library: Auto-loads, Filters work
- Royalty: Save Splits, View Statements
- Upload: File upload working
- PowerHarmony: All rooms wired

✅ **NO 404 ROUTES**

✅ **ALL REQUESTS INCLUDE JWT AUTH**

✅ **ERROR HANDLING IN PLACE**

---

## Next Steps (Optional)

1. Replace mock responses with real FFmpeg processing
2. Add WebSocket updates for long-running operations
3. Implement real-time collaboration features
4. Add progress bars for file uploads
5. Connect to real AI services (OpenAI, MusicGen, etc.)

---

**POWERSTREAM STUDIO WIRING COMPLETE** ✅


