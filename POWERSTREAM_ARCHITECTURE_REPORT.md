# PowerStream Ecosystem - Complete Architecture Report
**Generated:** $(date)
**Status:** Full Repository Scan Complete

---

## 1. FRONTEND STRUCTURE

### 1.1 Main Application (`frontend/src/`)
- **Entry Point**: `main.jsx` → `App.jsx`
- **Router**: React Router v6 (`BrowserRouter` via `main.jsx`)
- **Auth Context**: `context/AuthContext.jsx` (JWT-based, localStorage token storage)
- **API Client**: `lib/api.js` (Axios instance, auto-attaches JWT, dev: `localhost:5001`, prod: env-based)

### 1.2 Pages (`frontend/src/pages/`)

#### Core Social Pages:
- ✅ `PowerFeed.jsx` - Facebook-style feed (`/powerfeed`)
- ✅ `PowerGram.jsx` - Instagram-style grid (`/powergram`)
- ✅ `PowerReel.jsx` - TikTok-style vertical feed (`/powerreel`)
- ✅ `PowerLine.jsx` - Messenger-style chat (`/powerline`)

#### TV & Stations:
- ✅ `TVStations.jsx` - Stations hub (`/tv-stations`)
- ✅ `StationDetail.jsx` - Individual station page (`/tv-stations/:slug`)
- ✅ `SouthernPower.jsx` - SPS hub (`/southern-power`)
- ✅ `WorldTV.jsx` - Worldwide TV (`/world-tv`)
- ✅ `PowerStreamTV.jsx` - PS TV catalog (`/powerstream-tv`, `/ps-tv`)
- ✅ `FilmDetail.jsx` - Film/TV title detail (`/powerstream-tv/title/:id`)

#### Studio Pages (`frontend/src/pages/studio/`):
- ✅ `StudioBeatPage.jsx` - Beat Lab / Beat Store
- ✅ `StudioMixPage.jsx` - Mix & Master
- ✅ `StudioPlayerPage.jsx` - Audio/Video Player
- ✅ `StudioUploadsPage.jsx` - File Upload
- ✅ `StudioExportPage.jsx` - Export & Email
- ✅ `StudioRoyaltyPage.jsx` - Royalty Splits
- ✅ `StudioVisualizerPage.jsx` - Audio Visualizer
- ✅ `StudioLibraryPage.jsx` - Project Library
- ✅ `StudioSettingsPage.jsx` - Studio Settings
- ✅ `StudioRecordPage.jsx` - Recording Booth

**Studio Hub**: `Studio.jsx` - Tab-based container routing to all studio pages

#### PowerHarmony Pages (`frontend/src/pages/powerharmony/`):
- ✅ `Master.jsx` - Master Control Room (`/powerharmony/master`)
- ✅ `Write.jsx` - AI Lyric Writer (`/powerharmony/write`, `/powerharmony/writing`)
- ✅ `Live.jsx` - Live Record Booth (`/powerharmony/live`)
- ✅ `Vocal.jsx` - Vocal Booth (`/powerharmony/vocal`)
- ✅ `Mix.jsx` - Mix Room (`/powerharmony/mix`)
- ✅ `Mastering.jsx` - Mastering Room (`/powerharmony/mastering`)
- ✅ `Record.jsx` - Record Room (`/powerharmony/record`)

**Barrel Export**: `powerharmony/index.js` exports all PowerHarmony components

#### Auth Pages:
- ✅ `LoginPage.jsx` (`/login`)
- ✅ `RegisterPage.jsx` (`/signup`, `/register`)
- ✅ `ForgotPasswordPage.jsx`
- ✅ `ResetPasswordPage.jsx`

#### Other Pages:
- ✅ `Home.jsx` - Landing/Launchpad (`/`)
- ✅ `AIBrain.jsx` - AI Control Tower (`/ai-brain`)
- ✅ `MultistreamDashboard.jsx` - Multistream Management (`/multistream`)
- ⚠️ `StudioHubPage.jsx` - **DUPLICATE?** (separate from `Studio.jsx`)

### 1.3 Components (`frontend/src/components/`)

#### Social Components:
- `powerfeed/` - FeedLayout, FeedSidebar, FeedStream, PostComposer, StoryRail
- `powergram/` - GramLayout, GramGrid
- `powerreel/` - ReelLayout, ReelPlayer, ReelSidebar
- `powerline/` - ConversationList, MessageThread

#### Streaming Components:
- ✅ `GoLiveModal.jsx` - **ENHANCED** (presets, per-platform toggles, recording toggle)
- ✅ `StreamPlayer.jsx` - Live stream player (Livepeer/HLS/RTMP)
- ✅ `TalentVoting.jsx` - Texas Got Talent voting

#### Navigation:
- ✅ `GlobalNav.jsx` - Top navigation bar
- ✅ `ProtectedRoute.jsx` - Route guard (checks JWT token)

### 1.4 Styles (`frontend/src/styles/`)
- ✅ `studio.css` - Studio shared styles
- ✅ `Studio.module.css` - Studio module styles
- ✅ `StudioBeatLab.css` - Beat Lab specific
- ✅ `powerharmony.css` - PowerHarmony theme
- ✅ `powerstream-social.css` - Social feed styles
- ✅ `responsive.css` - Responsive utilities
- ❌ `powerharmony-studio.css` - **MISSING** (imported in StudioSettingsPage, removed)

### 1.5 API Clients (`frontend/src/lib/`)
- ✅ `api.js` - Main API client (localhost:5001 in dev)
- ✅ `apiClient.js` - Alternative client (MAIN_API_URL, STUDIO_API_URL)
- ✅ `streamApi.js` - Live streaming API (`/live/start`, `/live/stop`)
- ✅ `studioApi.js` - Recording Studio API (port 5100)
- ✅ `studioClient.js` - Studio-specific client
- ✅ `livepeer.js` - Livepeer integration
- ✅ `supabaseClient.js` - Supabase client (for media storage?)

---

## 2. BACKEND STRUCTURE

### 2.1 Main Server (`backend/server.js`)
- **Port**: 5001 (default)
- **Framework**: Express.js (ESM)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (`requireAuth.js` middleware)
- **CORS**: Configurable origins
- **NodeMediaServer**: Started on boot (RTMP server)

### 2.2 Routes (`backend/routes/`)

#### Auth:
- ✅ `authRoutes.js` - `/api/auth/*` (login, register, me, refresh)

#### Live Streaming:
- ✅ `liveRoutes.js` - `/api/live/*` (health, status, start, stop)
- ✅ `rtmpRoutes.js` - `/api/rtmp/*` (endpoints CRUD, status)
- ✅ `multistreamProfileRoutes.js` - `/api/multistream/profiles/*` (presets CRUD)
- ✅ `multistreamSessionRoutes.js` - `/api/multistream/sessions/*` (session history)
- ✅ `vodRoutes.js` - `/api/vod/*` (VOD asset management)
- ✅ `livepeerRoutes.js` - `/api/livepeer/*` (Livepeer integration)

#### Social:
- ✅ `powerFeedRoutes.js` - `/api/powerfeed/*`
- ✅ `powerGramRoutes.js` - `/api/powergram/*`
- ✅ `powerReelRoutes.js` - `/api/powerreel/*`
- ✅ `powerLineRoutes.js` - `/api/powerline/*`

#### TV & Stations:
- ✅ `tvStationRoutes.js` - `/api/tv-stations/*`
- ✅ `powerStreamTVRoutes.js` - `/api/ps-tv/*`
- ✅ `tgtRoutes.js` - `/api/tgt/*` (Texas Got Talent)

#### Studio (Main Backend):
- ⚠️ `studioRoutes.js` - `/api/studio/*` (may be minimal, see Recording Studio below)

#### Other:
- ✅ `userRoutes.js` - `/api/users/*`
- ✅ `adminRoutes.js` - `/api/admin/*`
- ✅ `feedRoutes.js`, `gramRoutes.js`, `reelRoutes.js` - Legacy routes?

### 2.3 Controllers (`backend/controllers/`)
- ✅ `liveController.js` - Live streaming logic (multistream integration)
- ✅ `authController.js` - Authentication logic
- ✅ `powerFeedController.js`, `powerGramController.js`, `powerReelController.js` - Social controllers
- ✅ `tvStationController.js` - TV station logic
- ✅ `powerStreamTVController.js` - PS TV catalog
- ✅ `chatController.js`, `chatmessageController.js` - Chat logic

### 2.4 Services (`backend/services/`)

#### Multistream:
- ✅ `MultistreamService.js` - **CORE** orchestrator (uses MultistreamProcessManager)
- ✅ `MultistreamProcessManager.js` - FFmpeg process lifecycle management
- ✅ `StreamingServer.js` - NodeMediaServer wrapper
- ✅ `StreamingServerEvents.js` - NodeMediaServer event handlers
- ✅ `VODService.js` - VOD asset processing

#### Other:
- ✅ `aiStudioService.js`, `aiStudioProService.js` - AI services
- ✅ `chatService.js` - Chat service
- ✅ `presenceService.js` - User presence

### 2.5 Models (`backend/models/`)

#### Multistream:
- ✅ `RTMPEndpoint.js` - RTMP endpoint configs (platform, URL, key, bridge-proxy)
- ✅ `MultistreamProfile.js` - Multistream presets
- ✅ `MultistreamSession.js` - Session tracking (status, endpoints, recording)
- ✅ `VODAsset.js` - Recorded video assets

#### Social:
- ✅ `FeedPost.js`, `FeedPostModel.js` - Feed posts
- ✅ `GramPost.js`, `GramPhotoModel.js` - Gram photos
- ✅ `Reel.js`, `ReelVideoModel.js` - Reel videos
- ✅ `Chatmodel.js`, `Chatmessagemodel.js` - Chat models

#### TV:
- ✅ `Station.js`, `StationModel.js` - TV stations
- ✅ `Film.js` - Films/TV titles
- ✅ `TGT.js`, `TgtContestant.js` - Texas Got Talent

#### User:
- ✅ `User.js`, `Usermodel.js` - User accounts

### 2.6 Recording Studio (`backend/recordingStudio/`)
**Separate server** (port 5100) with its own:
- `RecordingStudioServer.js` - Express server
- `routes/` - Studio-specific routes (beat, mix, master, library, royalty, etc.)
- `controllers/` - Studio controllers
- `models/` - Studio models (Beat, Mixdown, LibraryItem, etc.)
- `services/` - Audio processing services

**Note**: Frontend `studioApi.js` connects to this server, NOT main backend.

---

## 3. MULTISTREAM SYSTEM

### 3.1 Architecture
1. **NodeMediaServer** → Receives RTMP input (`rtmp://localhost:1935/live/<streamKey>`)
2. **MultistreamService** → Orchestrates fan-out
3. **MultistreamProcessManager** → Spawns/manages FFmpeg processes
4. **FFmpeg** → Fan-out to multiple RTMP endpoints (Facebook, YouTube, Twitch, etc.)

### 3.2 Features Implemented:
- ✅ RTMP endpoint management (CRUD)
- ✅ Multistream presets/profiles
- ✅ Per-platform toggles in GoLiveModal
- ✅ Station-aware filtering
- ✅ Recording toggle (records to local file)
- ✅ VOD asset model
- ✅ Session tracking (MultistreamSession model)
- ✅ Real-time status indicators

### 3.3 Features Missing/Incomplete:
- ⚠️ **VOD Post-Processing**: Recording files not automatically uploaded to cloud
- ⚠️ **VOD UI Integration**: RecordedContent component needs VOD asset fetching
- ⚠️ **Role-Based Access**: No admin/station owner restrictions yet
- ⚠️ **Rate Limiting**: No abuse prevention
- ⚠️ **WebSocket Status**: Status updates via polling, not real-time WebSocket
- ⚠️ **Session History Dashboard**: MultistreamDashboard needs session table
- ⚠️ **Preset Management UI**: No UI for creating/editing presets in dashboard

---

## 4. AUTHENTICATION SYSTEM

### 4.1 Frontend:
- ✅ `AuthContext.jsx` - Global auth state
- ✅ `ProtectedRoute.jsx` - Route guard
- ✅ `LoginPage.jsx`, `RegisterPage.jsx` - Auth pages
- ✅ Token stored in `localStorage` as `powerstream_token`
- ✅ Auto-attached to API requests via `api.js` interceptor

### 4.2 Backend:
- ✅ `authRoutes.js` - `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- ✅ `requireAuth.js` - JWT middleware
- ✅ `User.js` model - Password hashing (bcrypt)
- ✅ Seed scripts: `seedAdminUser.js`, `ensureOwnerUser.js`

### 4.3 Status:
- ✅ Login/Register working
- ✅ JWT protection on protected routes
- ⚠️ Role-based access not fully implemented (admin checks exist but not enforced everywhere)

---

## 5. DUPLICATES & CONFLICTS

### 5.1 Frontend:
- ⚠️ `Studio.jsx` vs `StudioHubPage.jsx` - **DUPLICATE?** (Studio.jsx is used in App.jsx)
- ⚠️ `PowerGram.jsx` vs `PowerGramPage.jsx` - **DUPLICATE?** (PowerGram.jsx is used)
- ⚠️ `PowerReel.jsx` vs `PowerReelPage.jsx` - **DUPLICATE?** (PowerReel.jsx is used)
- ⚠️ `PowerLine.jsx` vs `PowerLinePage.jsx` - **DUPLICATE?** (PowerLine.jsx is used)
- ⚠️ `TVStations.jsx` vs `TVStationsPage.jsx` - **DUPLICATE?** (TVStations.jsx is used)
- ⚠️ `PowerStreamTV.jsx` vs `PowerStreamTVPage.jsx` - **DUPLICATE?** (PowerStreamTV.jsx is used)
- ⚠️ `SouthernPower.jsx` vs `SouthernPowerSyndicatePage.jsx` - **DUPLICATE?** (SouthernPower.jsx is used)
- ⚠️ `WorldTV.jsx` vs `WorldwideTVPage.jsx` - **DUPLICATE?** (WorldTV.jsx is used)

### 5.2 Backend:
- ⚠️ `feedRoutes.js` vs `powerFeedRoutes.js` - **DUPLICATE?**
- ⚠️ `gramRoutes.js` vs `powerGramRoutes.js` - **DUPLICATE?**
- ⚠️ `reelRoutes.js` vs `powerReelRoutes.js` - **DUPLICATE?**
- ⚠️ `User.js` vs `Usermodel.js` - **DUPLICATE?**
- ⚠️ `Station.js` vs `StationModel.js` - **DUPLICATE?**
- ⚠️ `FeedPost.js` vs `FeedPostModel.js` - **DUPLICATE?**
- ⚠️ `Reel.js` vs `Reelmodel.js` vs `ReelVideoModel.js` - **MULTIPLE MODELS?**

---

## 6. MISSING ROUTES IN App.jsx

### 6.1 Studio Sub-Routes:
- ❌ `/studio/beat-store` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/mix` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/player` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/upload` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/export-email` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/royalty` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/visualizer` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/library` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/settings` - Not a route, handled by `Studio.jsx` tab
- ❌ `/studio/record` - Not a route, handled by `Studio.jsx` tab

**Note**: Studio uses tab-based navigation within `Studio.jsx`, not separate routes. This is **INTENTIONAL**.

---

## 7. TODO LIST - CRITICAL ITEMS

### 7.1 Multistream System (Phase 3-7):
- [ ] **VOD Post-Processing**: Auto-upload recorded files to cloud storage (S3/Cloudinary)
- [ ] **VOD UI**: Wire RecordedContent component to fetch VOD assets from `/api/vod`
- [ ] **Preset Management UI**: Add create/edit/delete preset UI to MultistreamDashboard
- [ ] **Session History Table**: Show recent sessions in MultistreamDashboard with status
- [ ] **WebSocket Status**: Replace polling with WebSocket for real-time platform status
- [ ] **Role-Based Access**: Restrict multistream endpoints to admin/station owners
- [ ] **Rate Limiting**: Add abuse prevention for stream starts
- [ ] **Documentation**: Update `/docs/STREAMING_WIRING.md` with full multistream flow

### 7.2 Studio & PowerHarmony:
- [ ] **Studio API Wiring**: Verify all Studio pages call correct Recording Studio endpoints (port 5100)
- [ ] **PowerHarmony API Wiring**: Wire PowerHarmony rooms to backend endpoints
- [ ] **Studio Routes**: Consider adding direct routes for studio pages (or keep tab-based?)
- [ ] **Missing Studio Endpoints**: Check if all studio actions have backend endpoints

### 7.3 TV Stations:
- [ ] **Live Status Integration**: Ensure StationDetail shows live status correctly
- [ ] **VOD Display**: Wire RecordedContent to show VOD assets from multistream recordings
- [ ] **Go Live Integration**: Verify GoLiveModal works from all station pages

### 7.4 Social Pages:
- [ ] **Backend Integration**: Verify PowerFeed, PowerGram, PowerReel, PowerLine fetch from correct APIs
- [ ] **Supabase vs Backend**: Clarify if social pages use Supabase or main backend
- [ ] **Real-time Updates**: Add WebSocket/SSE for feed updates

### 7.5 Code Cleanup:
- [ ] **Remove Duplicates**: Clean up duplicate page files (Page.jsx vs PagePage.jsx)
- [ ] **Remove Duplicates**: Clean up duplicate model files (Model.js vs ModelModel.js)
- [ ] **Remove Duplicates**: Clean up duplicate route files (feedRoutes vs powerFeedRoutes)
- [ ] **Consolidate API Clients**: Decide on single API client or keep multiple (api.js vs apiClient.js)

### 7.6 Auth & Security:
- [ ] **Role-Based Access**: Implement role checks across all protected routes
- [ ] **Token Refresh**: Add token refresh mechanism
- [ ] **Password Reset**: Complete password reset flow

### 7.7 Documentation:
- [ ] **API Documentation**: Document all endpoints
- [ ] **Architecture Docs**: Update architecture diagrams
- [ ] **Deployment Guide**: Create deployment checklist

---

## 8. FILE STRUCTURE SUMMARY

### Frontend:
- **Pages**: 30+ page components
- **Components**: 20+ reusable components
- **Routes**: 25+ routes in App.jsx
- **Styles**: 6 CSS files
- **API Clients**: 6 API client files

### Backend:
- **Routes**: 100+ route files
- **Controllers**: 66 controller files
- **Models**: 76 model files
- **Services**: 36 service files
- **Recording Studio**: Separate server with 123 files

---

## 9. KEY FINDINGS

### ✅ Strengths:
1. **Multistream System**: Well-architected with process management, session tracking, VOD support
2. **Modular Structure**: Clear separation of concerns (routes, controllers, services, models)
3. **Auth System**: JWT-based auth with protected routes
4. **Studio Integration**: Separate Recording Studio server for audio processing
5. **Component Reusability**: Good component structure for social pages

### ⚠️ Issues:
1. **Duplicate Files**: Many duplicate page/model/route files need cleanup
2. **Incomplete Wiring**: Some UI components not fully wired to backend
3. **Missing Features**: VOD post-processing, role-based access, WebSocket status
4. **Documentation**: Some areas lack documentation
5. **API Client Confusion**: Multiple API clients (api.js, apiClient.js, studioApi.js)

### 🔧 Recommendations:
1. **Consolidate Duplicates**: Remove unused duplicate files
2. **Complete Multistream**: Finish VOD pipeline and UI integration
3. **Unify API Clients**: Standardize on single API client pattern
4. **Add Documentation**: Document all endpoints and flows
5. **Implement Roles**: Add role-based access control

---

**END OF REPORT**





