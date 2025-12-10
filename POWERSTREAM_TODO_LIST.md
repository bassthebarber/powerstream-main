# PowerStream Ecosystem - TODO List
**Generated:** $(date)
**Priority:** Critical → High → Medium → Low

---

## 🔴 CRITICAL - Must Complete Next

### Multistream System
- [ ] **VOD Post-Processing Pipeline**
  - Auto-upload recorded MP4/TS files to cloud storage (S3/Cloudinary) after stream ends
  - Create VODAsset entries in database with videoUrl pointing to cloud storage
  - Generate thumbnails for VOD assets
  - File: `backend/services/VODService.js`

- [ ] **VOD UI Integration**
  - Wire `RecordedContent` component in `StationDetail.jsx` to fetch VOD assets via `GET /api/vod?stationId=...`
  - Display VOD assets as cards with thumbnail, title, duration, recorded date
  - Add video player for VOD playback
  - File: `frontend/src/pages/StationDetail.jsx`

- [ ] **Preset Management UI**
  - Add "Create Preset" button to MultistreamDashboard
  - Add preset creation modal (name, description, select endpoints)
  - Add edit/delete preset functionality
  - File: `frontend/src/pages/MultistreamDashboard.jsx`

- [ ] **Session History Dashboard**
  - Add table showing recent multistream sessions (station, start time, duration, platforms, status)
  - Add filters (by station, date range)
  - Add detailed session view (per-platform status, logs)
  - File: `frontend/src/pages/MultistreamDashboard.jsx`

### Code Cleanup
- [ ] **Remove Duplicate Page Files**
  - Delete: `PowerGramPage.jsx`, `PowerReelPage.jsx`, `PowerLinePage.jsx`, `TVStationsPage.jsx`, `PowerStreamTVPage.jsx`, `SouthernPowerSyndicatePage.jsx`, `WorldwideTVPage.jsx`, `StudioHubPage.jsx`
  - Keep: `PowerGram.jsx`, `PowerReel.jsx`, `PowerLine.jsx`, `TVStations.jsx`, `PowerStreamTV.jsx`, `SouthernPower.jsx`, `WorldTV.jsx`, `Studio.jsx`

- [ ] **Remove Duplicate Model Files**
  - Audit and consolidate: `User.js` vs `Usermodel.js`, `Station.js` vs `StationModel.js`, `FeedPost.js` vs `FeedPostModel.js`, `Reel.js` vs `Reelmodel.js` vs `ReelVideoModel.js`
  - Update all imports to use single model

- [ ] **Remove Duplicate Route Files**
  - Audit: `feedRoutes.js` vs `powerFeedRoutes.js`, `gramRoutes.js` vs `powerGramRoutes.js`, `reelRoutes.js` vs `powerReelRoutes.js`
  - Consolidate to single route file per feature

---

## 🟠 HIGH PRIORITY - Important Features

### Multistream System
- [ ] **WebSocket Real-Time Status**
  - Replace polling in GoLiveModal with WebSocket connection
  - Broadcast platform status updates in real-time
  - Files: `backend/sockets/multistreamSocket.js` (new), `frontend/src/components/GoLiveModal.jsx`

- [ ] **Role-Based Access Control**
  - Add role checks to RTMP endpoint management routes
  - Restrict multistream start to admin/station owners
  - Add role field to User model if missing
  - Files: `backend/middleware/roleMiddleware.js`, `backend/routes/rtmpRoutes.js`, `backend/routes/liveRoutes.js`

- [ ] **Rate Limiting**
  - Add rate limiting to `/api/live/start` (max 1 stream per user, cooldown period)
  - Add rate limiting to RTMP endpoint creation
  - File: `backend/middleware/rateLimiter.js` (new)

### Studio & PowerHarmony
- [ ] **PowerHarmony API Wiring**
  - Wire PowerHarmony rooms to backend endpoints:
    - `/powerharmony/vocal` → `POST /api/studio/record/start`
    - `/powerharmony/live` → `POST /api/studio/live/session`
    - `/powerharmony/write` → `POST /api/studio/lyrics/generate`
    - `/powerharmony/mastering` → `POST /api/studio/master/apply`
  - Files: `frontend/src/pages/powerharmony/*.jsx`

- [ ] **Studio API Verification**
  - Verify all Studio pages call correct Recording Studio endpoints (port 5100)
  - Ensure `studioApi.js` is used consistently
  - Test all studio actions (beat generation, mix, export, etc.)
  - Files: `frontend/src/pages/studio/*.jsx`, `frontend/src/lib/studioApi.js`

### TV Stations
- [ ] **Live Status Polling**
  - Ensure StationDetail polls `/api/live/status` correctly
  - Show "LIVE" badge when station is live
  - Connect StreamPlayer to live stream URL
  - File: `frontend/src/pages/StationDetail.jsx`

- [ ] **Go Live Integration**
  - Test GoLiveModal from all station pages
  - Verify stationId is passed correctly
  - Verify multistream starts with station's endpoints
  - Files: `frontend/src/pages/StationDetail.jsx`, `frontend/src/components/GoLiveModal.jsx`

### Social Pages
- [ ] **Backend API Verification**
  - Verify PowerFeed fetches from `/api/powerfeed/posts`
  - Verify PowerGram fetches from `/api/powergram/photos`
  - Verify PowerReel fetches from `/api/powerreel/`
  - Verify PowerLine fetches from `/api/powerline/conversations`
  - Files: `frontend/src/pages/PowerFeed.jsx`, `PowerGram.jsx`, `PowerReel.jsx`, `PowerLine.jsx`

- [ ] **Supabase vs Backend Clarification**
  - Determine if social pages should use Supabase or main backend
  - Update API calls accordingly
  - Remove unused Supabase imports if not needed

---

## 🟡 MEDIUM PRIORITY - Enhancements

### Multistream System
- [ ] **Documentation**
  - Update `/docs/STREAMING_WIRING.md` with:
    - NodeMediaServer setup
    - RTMP endpoint configuration
    - Go Live flow from Studio/Station pages
    - Recording and VOD pipeline
    - OBS/external encoder setup
  - File: `docs/STREAMING_WIRING.md`

- [ ] **Error Handling**
  - Improve error messages in GoLiveModal
  - Add retry logic for failed platform connections
  - Add error logging to MultistreamSession model
  - Files: `frontend/src/components/GoLiveModal.jsx`, `backend/services/MultistreamService.js`

- [ ] **Metrics & Analytics**
  - Track stream duration, platform success rates
  - Store metrics in MultistreamSession
  - Display metrics in MultistreamDashboard
  - Files: `backend/models/MultistreamSession.js`, `frontend/src/pages/MultistreamDashboard.jsx`

### Auth & Security
- [ ] **Token Refresh**
  - Implement token refresh mechanism
  - Auto-refresh token before expiry
  - Files: `frontend/src/context/AuthContext.jsx`, `backend/routes/authRoutes.js`

- [ ] **Password Reset Flow**
  - Complete password reset implementation
  - Test forgot password → reset password flow
  - Files: `frontend/src/pages/ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`, `backend/routes/authRoutes.js`

### API Client Consolidation
- [ ] **Unify API Clients**
  - Decide on single API client pattern
  - Consolidate `api.js` and `apiClient.js` if duplicates
  - Ensure consistent error handling
  - Files: `frontend/src/lib/api.js`, `frontend/src/lib/apiClient.js`

### UI/UX
- [ ] **Loading States**
  - Add loading spinners to all async operations
  - Improve error message display
  - Add success notifications

- [ ] **Responsive Design**
  - Test all pages on mobile devices
  - Fix any responsive issues
  - File: `frontend/src/styles/responsive.css`

---

## 🟢 LOW PRIORITY - Nice to Have

### Features
- [ ] **Real-Time Social Updates**
  - Add WebSocket/SSE for feed updates
  - Real-time notifications for likes, comments, messages

- [ ] **Advanced Multistream Features**
  - Schedule streams
  - Stream analytics dashboard
  - Custom RTMP endpoint validation

- [ ] **Studio Enhancements**
  - Collaborative editing
  - Version control for projects
  - Cloud project sync

### Documentation
- [ ] **API Documentation**
  - Generate OpenAPI/Swagger docs
  - Document all endpoints with examples

- [ ] **Architecture Diagrams**
  - Create system architecture diagram
  - Create data flow diagrams
  - Create component hierarchy diagrams

- [ ] **Deployment Guide**
  - Create step-by-step deployment guide
  - Document environment variables
  - Document required services (MongoDB, Redis, etc.)

---

## 📋 SUMMARY

### Total Items: 35+
- **Critical**: 7 items
- **High Priority**: 10 items
- **Medium Priority**: 10 items
- **Low Priority**: 8+ items

### Focus Areas:
1. **Multistream System**: VOD pipeline, UI integration, presets, roles
2. **Code Cleanup**: Remove duplicates, consolidate models/routes
3. **Studio/PowerHarmony**: Complete API wiring
4. **TV Stations**: Live status, VOD display
5. **Social Pages**: Backend integration verification

---

**END OF TODO LIST**





