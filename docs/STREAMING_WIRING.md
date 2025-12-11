# PowerStream Streaming & Multistream Wiring

## Overview

PowerStream’s live system is built around three core pieces:

- **UI pages & components**: `StationDetail.jsx`, `GoLiveModal.jsx`, `MultistreamDashboard.jsx`, `StreamPlayer.jsx`, `RecordedContent.jsx`
- **HTTP API (main backend on :5001)**: `/api/live/*`, `/api/rtmp/*`, `/api/vod/*`
- **Streaming services**: `StreamingServer` (NodeMediaServer RTMP ingest), `MultistreamService` + `MultistreamProcessManager` (FFmpeg fan‑out) and `VODService`/`VODAsset` (recordings)

This file explains how **Go Live** and **VOD replays** flow through the system.

---

## 1. Go Live Flow (UI → API → MultistreamService)

### 1.1 User Interface

**Station pages**

- **File**: `frontend/src/pages/StationDetail.jsx`
- **Route**: `/tv-stations/:slug`

Key elements:

- **Go Live button** (top right of station header)
  - Only shown if the user is authenticated (and may later be restricted by role).
  - Clicking it toggles `showGoLiveModal` and renders `GoLiveModal`.
- **LIVE pill** under station title
  - Uses `isLive || station.isLive` to show `🔴 LIVE` vs `Off Air`.
  - `isLive` is maintained locally and via polling `/api/live/status`.

```jsx
// StationDetail.jsx (simplified)
{user && (
  <button onClick={() => setShowGoLiveModal(true)}>
    {isLive ? "🔴 LIVE" : "🔴 Go Live"}
  </button>
)}

{showGoLiveModal && (
  <GoLiveModal
    isOpen={showGoLiveModal}
    onClose={() => setShowGoLiveModal(false)}
    stationId={station?.id}
    stationName={station?.name}
    onStarted={() => setIsLive(true)}
    onStopped={() => {
      setIsLive(false);
      setVodRefreshKey((k) => k + 1);
    }}
  />
)}
```

**Go Live modal**

- **File**: `frontend/src/components/GoLiveModal.jsx`

Responsibilities:

- Collects:
  - `streamKey`
  - `title`, `description`
  - `stationId`
  - optional multistream options (`profileId`, `selectedEndpoints`, `recordingEnabled`)
- Fetches RTMP endpoints and multistream profiles for the user via:
  - `GET /api/rtmp/endpoints?stationId=...`
  - `GET /api/multistream/profiles?stationId=...`
- Starts a session via `startStream(payload)` (wrapper around `/api/live/start`).
- Stops the current session via `stopStream(sessionId)` (wrapper around `/api/live/stop`).
- Polls multistream status via `GET /api/rtmp/status`.

```js
// GoLiveModal.jsx -> start
const result = await startStream({
  streamKey: streamKey.trim(),
  title: title.trim() || `${stationName} Live`,
  description: description.trim(),
  stationId,
  useMultistream: true,
  profileId: selectedProfileId || null,
  selectedEndpoints: selectedProfileId ? null : selectedEndpoints,
  recordingEnabled,
});
```

On success:

- Saves `sessionId`, sets `isLive` internally, and calls `onStarted(result)` so `StationDetail` can flip its LIVE badge immediately.

```js
if (result?.sessionId) {
  setSessionId(result.sessionId);
  setIsLive(true);
  if (result.multistream) setMultistreamStatus(result.multistream);
  if (typeof onStarted === "function") onStarted(result);
}
```

On stop:

- Calls `stopStream(sessionId)`, clears local state, and triggers `onStopped()` so `StationDetail` can update UI and refresh VOD.

```js
await stopStream(sessionId);
setIsLive(false);
setSessionId(null);
setMultistreamStatus(null);
setStreamKey("");
setTitle("");
if (typeof onStopped === "function") onStopped();
```

---

### 1.2 API Layer

**Live routes**

- **File**: `backend/routes/liveRoutes.js`
- **Base path**: `/api/live`

Routes:

| Route           | Method | Auth         | Description                         |
|----------------|--------|-------------|-------------------------------------|
| `/health`      | GET    | none        | Health check                        |
| `/status`      | GET    | none        | Current live stream status          |
| `/start`       | POST   | auth (JWT)  | Start live stream + multistream     |
| `/stop`        | POST   | auth (JWT)  | Stop live stream + multistream      |

`/start` and `/stop`:

- Are protected by `authRequired` (JWT).
- Delegate to `liveController.startStream` and `liveController.stopStream`.

```js
// liveRoutes.js
router.post("/start", authRequired, startStream);
router.post("/stop", authRequired, stopStream);
```

**RTMP/multistream routes**

- **File**: `backend/routes/rtmpRoutes.js`
- **Base path**: `/api/rtmp`

Routes:

| Route                  | Method | Auth         | Description                                   |
|------------------------|--------|-------------|-----------------------------------------------|
| `/endpoints`           | GET    | auth (JWT)  | List RTMP endpoints for current user         |
| `/endpoints`           | POST   | auth (JWT)  | Create endpoint                               |
| `/endpoints/:id`       | PUT    | auth (JWT)  | Update endpoint                               |
| `/endpoints/:id`       | DELETE | auth (JWT)  | Delete endpoint                               |
| `/endpoints/:id/status`| GET    | auth (JWT)  | Single endpoint status                        |
| `/status`              | GET    | auth (JWT)  | All active multistream session statuses       |

`GoLiveModal` uses:

- `GET /api/rtmp/endpoints?stationId=<id>` to populate per‑station platform toggles.
- `GET /api/rtmp/status` to show per‑session/per‑platform green/yellow/red indicators.

**Live API helpers**

- **File**: `frontend/src/lib/streamApi.js`

Key functions:

```js
export async function startStream(payload) {
  const { data } = await api.post("/live/start", payload);
  return data;
}

export async function stopStream(sessionId) {
  const { data } = await api.post("/live/stop", { sessionId });
  return data;
}

export async function getActiveStreams() {
  const { data } = await api.get("/live/status");
  return data ? [data] : [];
}
```

---

### 1.3 Services: StreamingServer, MultistreamService, MultistreamProcessManager

**Streaming server (NodeMediaServer)**

- **File**: `backend/services/StreamingServer.js`
- Responsibility:
  - Start NodeMediaServer (RTMP ingest and HLS output).
  - Provide helper `getRTMPIngestUrl(streamKey)` to build ingest URLs used by `liveController`.
  - Expose hooks `onPublish`, `onDonePublish` consumed from `StreamingServerEvents.js`.

**Multistream service**

- **File**: `backend/services/MultistreamService.js`

Responsibilities:

- Chooses which RTMP endpoints to send to based on:
  - `userId`
  - `stationId`
  - `profileId` or `selectedEndpoints`
- Delegates the actual FFmpeg fan‑out to `MultistreamProcessManager.startProcess`.
- Exposes:
  - `startMultistream(sessionId, inputRtmpUrl, userId, options)`
  - `stopMultistream(sessionId)`
  - `getMultistreamStatus(sessionId)`
  - `getAllActiveMultistreams()`

**FFmpeg process manager**

- **File**: `backend/services/MultistreamProcessManager.js`

Responsibilities:

- Start one FFmpeg process per session to:
  - Read from NodeMediaServer RTMP ingest (`rtmp://.../live/<streamKey>`).
  - Fan‑out to multiple RTMP endpoints (Facebook, YouTube, Twitch, Kick, LinkedIn, TikTok/Instagram via bridge).
  - Optionally record the stream to disk for VOD.
- Track:
  - `sessionId`, `userId`, `stationId`
  - `endpoints` used
  - `recordingPath` (if recording enabled)
- Provide **status snapshots** used by:
  - `/api/rtmp/status` (dashboard)
  - `/api/multistream/sessions` (session history).

**Live controller**

- **File**: `backend/controllers/liveController.js`

High‑level:

- Builds a **session id** and **input RTMP URL**.
- Calls `MultistreamService.startMultistream` with:
  - `stationId`
  - `profileId`, `selectedEndpoints`
  - `recordingEnabled`
- Stores in‑memory `LIVE_STATUS` (for `/live/status`).
- On stop:
  - Calls `MultistreamService.stopMultistream(sessionId)`.
  - Resets `LIVE_STATUS`.

---

## 2. VOD Recording & Playback (VODAsset → RecordedContent)

### 2.1 Recording pipeline (high level)

> Note: recording and upload details may still use mocked or local storage; the wiring is designed to be production‑ready.

When `recordingEnabled` is `true` for a multistream session:

1. `GoLiveModal` includes `recordingEnabled: true` in the `/live/start` payload.
2. `liveController.startStream` forwards this to `MultistreamService.startMultistream`.
3. `MultistreamProcessManager.startProcess`:
   - Adds FFmpeg arguments to write a local recording file alongside RTMP fan‑out.
   - Tracks the recording path in its internal state.
4. When a session ends (`/live/stop` or NodeMediaServer disconnect):
   - `MultistreamProcessManager` finalizes the process and returns the recording path.
   - `VODService` processes the recorded file:
     - Optionally uploads it to cloud storage (e.g., Cloudinary/S3).
     - Creates or updates a `VODAsset` document.

### 2.2 VOD model & service

**VODAsset model**

- **File**: `backend/models/VODAsset.js`
- Fields (simplified):

```js
{
  userId,
  stationId,
  multistreamSessionId,
  title,
  description,
  videoUrl,
  thumbnailUrl,
  duration,
  status,       // e.g. "ready"
  recordedAt
}
```

**VODService**

- **File**: `backend/services/VODService.js`
- Responsibilities:
  - Create and update `VODAsset` entries when recordings finish.
  - Handle uploads and thumbnail generation when cloud storage is configured.

**VOD routes**

- **File**: `backend/routes/vodRoutes.js`
- **Base path**: `/api/vod`

Key route for station pages:

| Route     | Method | Auth | Description                                 |
|----------|--------|------|---------------------------------------------|
| `/`      | GET    | JWT  | List VOD assets, optionally by `stationId` |

Example:

```http
GET /api/vod?stationId=<station-id>&limit=20
```

Response shape (simplified):

```json
{
  "ok": true,
  "assets": [
    {
      "id": "vod_123",
      "title": "No Limit Live – Episode 1",
      "description": "First live show",
      "videoUrl": "https://.../vod_123.m3u8",
      "thumbnailUrl": "https://.../vod_123.jpg",
      "duration": 3600,
      "recordedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2.3 Frontend VOD display

**VOD API helper**

- **File**: `frontend/src/lib/streamApi.js`

```js
export async function fetchVODAssets(stationId, limit = 20) {
  const params = { limit };
  if (stationId) params.stationId = stationId;
  const { data } = await api.get("/vod", { params });
  return data;
}
```

**RecordedContent component**

- **File**: `frontend/src/components/RecordedContent.jsx`

Responsibilities:

- Accept `stationId` as prop.
- Call `fetchVODAssets(stationId, 20)` on mount and whenever `stationId` changes.
- Render:
  - Loading state (“Loading replays...”).
  - Error state (red message).
  - Empty state (“No recorded shows for this station yet.”).
  - VOD cards with thumbnail, title, description, meta (date/duration) and inline video player if `videoUrl` is present.

**Usage in StationDetail**

```jsx
<RecordedContent
  stationId={station.id}
  key={`${station.id}-${vodRefreshKey}`} // forces refresh after Go Live stops
/>
```

`StationDetail` increments `vodRefreshKey` in `onStopped` from `GoLiveModal`, which remounts `RecordedContent` to fetch the latest VOD entries right after a stream ends.

---

## 3. Multistream Dashboard & Status

**Dashboard page**

- **File**: `frontend/src/pages/MultistreamDashboard.jsx`
- **Route**: `/multistream`

Responsibilities:

- Manage RTMP endpoints: list/add/edit/delete using `/api/rtmp/endpoints` routes.
- Show per‑endpoint health:
  - `lastStatus`, `lastError`, `lastConnectedAt`, `isActive`.
- Show live multistream sessions:
  - Poll `GET /api/rtmp/status` to display sessions and per‑platform status.

**Status endpoint**

- `GET /api/rtmp/status` → `getAllActiveMultistreams()` from `MultistreamService`.

Payload example:

```json
{
  "ok": true,
  "sessions": [
    {
      "sessionId": "stream_123",
      "userId": "user_1",
      "stationId": "station_1",
      "isActive": true,
      "startedAt": "2024-01-01T00:00:00Z",
      "endpoints": [
        { "platform": "youtube", "name": "Main Channel", "status": "connected" }
      ]
    }
  ],
  "totalActive": 1
}
```

---

## 4. Quick Reference

### UI → API → Service Chains

- **Go Live from station**
  - `StationDetail.jsx` → `GoLiveModal.jsx` →
  - `POST /api/live/start` →
  - `liveController.startStream` →
  - `StreamingServer.getRTMPIngestUrl` + `MultistreamService.startMultistream` →
  - `MultistreamProcessManager.startProcess` (FFmpeg + optional recording).

- **Stop Live**
  - `GoLiveModal.jsx` → `POST /api/live/stop` →
  - `liveController.stopStream` → `MultistreamService.stopMultistream`.

- **RTMP endpoints & multistream status**
  - `GoLiveModal.jsx` / `MultistreamDashboard.jsx` →
  - `/api/rtmp/endpoints`, `/api/rtmp/status` →
  - `RTMPEndpoint` + `MultistreamService.getAllActiveMultistreams`.

- **VOD listing on station page**
  - `StationDetail.jsx` → `RecordedContent.jsx` →
  - `GET /api/vod?stationId=...` →
  - `VODService` + `VODAsset` model.

---

**STREAMING WIRING: COMPLETE (UI → API → Services documented)** ✅





