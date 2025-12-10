# PowerStream Wiring - Prioritized Action Plan
**Generated:** $(date)
**Status:** PHASE 0 - Planning

---

## 🔴 CRITICAL PRIORITY (Must Fix First)

### A) Multistream: VOD Post-Processing Pipeline
**Issue**: Recorded streams create local files but don't automatically upload to cloud or create VODAsset entries
**Impact**: Recorded streams are not accessible after recording
**Files to Touch**:
- `backend/services/VODService.js` (create/update post-processing logic)
- `backend/services/MultistreamProcessManager.js` (trigger VOD creation after recording)
- `backend/models/VODAsset.js` (verify model structure)

**Wiring Path**: 
`MultistreamProcessManager` → `VODService.createVODAsset()` → Cloud upload → `VODAsset` model

---

### B) Multistream: VOD UI Integration
**Issue**: RecordedContent component in StationDetail doesn't fetch VOD assets
**Impact**: Users can't see recorded streams on station pages
**Files to Touch**:
- `frontend/src/pages/StationDetail.jsx` (add VOD fetching to RecordedContent section)
- `frontend/src/lib/api.js` (verify VOD endpoint exists)

**Wiring Path**:
`StationDetail` → `api.get("/vod")` → Display VOD assets in RecordedContent

---

### C) Multistream: Preset Management UI
**Issue**: No UI to create/edit/delete multistream presets in MultistreamDashboard
**Impact**: Users must use API directly to manage presets
**Files to Touch**:
- `frontend/src/pages/MultistreamDashboard.jsx` (add preset CRUD UI)
- `frontend/src/lib/api.js` (verify preset endpoints exist)

**Wiring Path**:
`MultistreamDashboard` → `api.get/post/put/delete("/multistream/profiles")` → Display/manage presets

---

## 🟠 HIGH PRIORITY (Important Features)

### D) Multistream: Session History Dashboard
**Issue**: MultistreamDashboard doesn't show session history table
**Impact**: Users can't see past streams or their status
**Files to Touch**:
- `frontend/src/pages/MultistreamDashboard.jsx` (add session history table)
- `frontend/src/lib/api.js` (verify session endpoints exist)

**Wiring Path**:
`MultistreamDashboard` → `api.get("/multistream/sessions")` → Display session table

---

### E) Code Cleanup: Remove Duplicate Page Files
**Issue**: Multiple duplicate page files (PowerGramPage.jsx vs PowerGram.jsx, etc.)
**Impact**: Code confusion, potential routing conflicts
**Files to Touch**:
- Delete: `PowerGramPage.jsx`, `PowerReelPage.jsx`, `PowerLinePage.jsx`, `TVStationsPage.jsx`, `PowerStreamTVPage.jsx`, `SouthernPowerSyndicatePage.jsx`, `WorldwideTVPage.jsx`, `StudioHubPage.jsx`
- Verify: `App.jsx` doesn't import deleted files

**Wiring Path**: N/A (cleanup only)

---

### F) Studio: Verify All Buttons Call studioApi
**Issue**: Need to verify all Studio page buttons are wired to studioApi
**Impact**: Some studio features may not work
**Files to Touch**:
- `frontend/src/pages/studio/StudioBeatPage.jsx`
- `frontend/src/pages/studio/StudioMixPage.jsx`
- `frontend/src/pages/studio/StudioExportPage.jsx`
- `frontend/src/pages/studio/StudioRoyaltyPage.jsx`
- `frontend/src/pages/studio/StudioRecordPage.jsx`
- `frontend/src/lib/studioApi.js` (verify all functions exist)

**Wiring Path**: 
Studio buttons → `studioApi.*()` → Recording Studio backend (port 5100)

---

### G) PowerHarmony: Wire Rooms to Backend
**Issue**: PowerHarmony rooms may not be fully wired to backend endpoints
**Impact**: PowerHarmony features may not work
**Files to Touch**:
- `frontend/src/pages/powerharmony/Vocal.jsx`
- `frontend/src/pages/powerharmony/Live.jsx`
- `frontend/src/pages/powerharmony/Write.jsx`
- `frontend/src/pages/powerharmony/Mastering.jsx`
- `frontend/src/lib/studioApi.js` (add PowerHarmony functions if missing)

**Wiring Path**:
PowerHarmony buttons → `studioApi.*()` → Recording Studio backend

---

### H) TV Stations: Live Status Integration
**Issue**: StationDetail may not correctly show live status
**Impact**: Users can't tell when a station is live
**Files to Touch**:
- `frontend/src/pages/StationDetail.jsx` (verify live status polling)
- `frontend/src/components/StreamPlayer.jsx` (verify live URL connection)

**Wiring Path**:
`StationDetail` → `api.get("/live/status")` → Show "LIVE" badge → `StreamPlayer` with live URL

---

## 🟡 MEDIUM PRIORITY (Enhancements)

### I) Multistream: Role-Based Access Control
**Issue**: No role checks on multistream endpoints
**Impact**: Any authenticated user can start multistreams
**Files to Touch**:
- `backend/middleware/roleMiddleware.js` (create if missing)
- `backend/routes/rtmpRoutes.js` (add role checks)
- `backend/routes/liveRoutes.js` (add role checks)

**Wiring Path**: 
Routes → `roleMiddleware` → Check user role → Allow/deny

---

### J) Multistream: WebSocket Real-Time Status
**Issue**: Status updates use polling instead of WebSocket
**Impact**: Less efficient, slower updates
**Files to Touch**:
- `backend/sockets/multistreamSocket.js` (create)
- `frontend/src/components/GoLiveModal.jsx` (replace polling with WebSocket)

**Wiring Path**: 
`GoLiveModal` → WebSocket connection → Real-time status updates

---

### K) Social Pages: Backend API Verification
**Issue**: Need to verify PowerFeed/PowerGram/PowerReel/PowerLine fetch from correct APIs
**Impact**: Social features may not work
**Files to Touch**:
- `frontend/src/pages/PowerFeed.jsx`
- `frontend/src/pages/PowerGram.jsx`
- `frontend/src/pages/PowerReel.jsx`
- `frontend/src/pages/PowerLine.jsx`

**Wiring Path**: 
Social pages → `api.get/post("/powerfeed|powergram|powerreel|powerline/*")` → Display data

---

## 🟢 LOW PRIORITY (Nice to Have)

### L) Code Cleanup: Remove Duplicate Models
**Issue**: Duplicate model files (User.js vs Usermodel.js, etc.)
**Impact**: Code confusion
**Files to Touch**: Multiple model files (audit first)

---

### M) Code Cleanup: Remove Duplicate Routes
**Issue**: Duplicate route files (feedRoutes.js vs powerFeedRoutes.js, etc.)
**Impact**: Code confusion
**Files to Touch**: Multiple route files (audit first)

---

### N) Documentation: Update Streaming Wiring Docs
**Issue**: Documentation may be outdated
**Impact**: Harder for developers to understand system
**Files to Touch**:
- `docs/STREAMING_WIRING.md`

---

## 📊 PHASE BREAKDOWN

### Phase 1: Multistream VOD Post-Processing (A)
- Files: 2-3 backend files
- Focus: Complete recording → VOD asset creation pipeline

### Phase 2: Multistream VOD UI (B)
- Files: 1-2 frontend files
- Focus: Display VOD assets in StationDetail

### Phase 3: Multistream Preset UI (C)
- Files: 1-2 frontend files
- Focus: Add preset management to MultistreamDashboard

### Phase 4: Multistream Session History (D)
- Files: 1-2 frontend files
- Focus: Add session history table to MultistreamDashboard

### Phase 5: Code Cleanup - Duplicate Pages (E)
- Files: 8-10 files (deletions)
- Focus: Remove unused duplicate page files

### Phase 6: Studio Button Verification (F)
- Files: 5-6 frontend files
- Focus: Verify all Studio buttons call studioApi

### Phase 7: PowerHarmony Wiring (G)
- Files: 4-5 frontend files
- Focus: Wire PowerHarmony rooms to backend

### Phase 8: TV Stations Live Status (H)
- Files: 1-2 frontend files
- Focus: Verify live status display

### Phase 9+: Continue with remaining items...

---

## ✅ READY TO BEGIN

**Next Step**: Wait for confirmation, then proceed with **Phase 1: Multistream VOD Post-Processing**

---

**END OF PRIORITIZED PLAN**





