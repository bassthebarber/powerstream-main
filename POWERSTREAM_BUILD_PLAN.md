# PowerStream Omni-Build Plan
**Status: Phase 0 Complete → Starting Phase 1**

## Repository Overview

### Frontend (React + Vite)
- **Location:** `frontend/`
- **Tech Stack:** React 18, Vite, React Router v6, Axios, Socket.io-client
- **Pages:** Home, PowerFeed, PowerGram, PowerReel, PowerLine, TV Stations, Studio, etc.
- **Auth:** Currently mixed - Supabase (AuthContext) + JWT (LoginPage) - **NEEDS UNIFICATION**

### Backend (Node/Express + MongoDB)
- **Location:** `backend/`
- **Tech Stack:** Express, MongoDB/Mongoose, JWT, bcrypt, Socket.io, Cloudinary
- **Routes:** Extensive - auth, feed, gram, reel, chat, TV, studio, AI, etc.
- **Auth:** JWT-based with User model

## Phase Status

### ✅ Phase 0: Discovery & Plan - COMPLETE
- Scanned repo structure
- Identified key components and routes
- Documented current state

### 🔄 Phase 1: Auth & Master Login - IN PROGRESS
**Issues Found:**
1. AuthContext uses Supabase but LoginPage uses JWT backend
2. Need to unify to JWT-only
3. Owner user seed script exists but needs verification
4. ProtectedRoute uses localStorage token check (good)

**Tasks:**
- [ ] Unify auth to JWT-only (remove Supabase dependency from AuthContext)
- [ ] Verify owner user seeding works
- [ ] Ensure all API calls attach JWT token
- [ ] Test login flow end-to-end

### ⏳ Phase 2: Home / Launchpad
- [ ] Implement spinning logo (200px, smooth animation)
- [ ] Add welcome audio with localStorage check
- [ ] Polish 8-button navigation grid
- [ ] Ensure auth-aware navigation

### ⏳ Phase 3: Global Navigation & Layout
- [ ] Create reusable Layout component
- [ ] Top bar with logo, search, user avatar
- [ ] Mobile bottom dock
- [ ] Apply to all feature pages

### ⏳ Phase 4: PowerFeed (Facebook-style)
- [ ] Verify 3-column layout
- [ ] Wire composer to backend
- [ ] Wire feed list to backend
- [ ] Add story bar
- [ ] Add "People you may know" sidebar

### ⏳ Phase 5: PowerGram & PowerReel
- [ ] PowerGram: Grid + modal viewer
- [ ] PowerReel: Vertical scroll with auto-play
- [ ] Backend integration for both

### ⏳ Phase 6: PowerLine (Chat)
- [ ] Chat sidebar with conversation list
- [ ] Chat window with message bubbles
- [ ] Socket.io integration (if configured)
- [ ] Backend message routes

### ⏳ Phase 7: TV System
- [ ] TV Stations hub page
- [ ] Individual station pages
- [ ] PS TV catalog (Netflix-style)
- [ ] StreamPlayer integration

### ⏳ Phase 8: AI Studio
- [ ] Verify all tabs work
- [ ] Wire backend endpoints
- [ ] Implement "Send to PowerStream" flow

### ⏳ Phase 9: AI Brain & Control Tower
- [ ] Central AI entrypoint
- [ ] Command routing
- [ ] Basic health checks

### ⏳ Phase 10: Polish & Production Prep
- [ ] Unify theme (CSS variables)
- [ ] Responsive design audit
- [ ] Dead code cleanup
- [ ] Env/build validation
- [ ] README updates

## Key Files to Modify

### Frontend
- `src/context/AuthContext.jsx` - Remove Supabase, use JWT
- `src/pages/Home.jsx` - Polish launchpad
- `src/components/ProtectedRoute.jsx` - Already good
- `src/lib/api.js` - Already good
- `src/pages/PowerFeed.jsx` - Backend integration
- `src/pages/PowerGram.jsx` - Backend integration
- `src/pages/PowerReel.jsx` - Backend integration
- `src/pages/PowerLine.jsx` - Backend integration
- `src/pages/Studio.jsx` - Backend integration

### Backend
- `routes/authRoutes.js` - Already implemented
- `scripts/ensureOwnerUser.js` - Already exists
- `middleware/auth.js` - Verify JWT middleware
- Various route files - Ensure JWT protection

## Critical Issues to Fix

1. **Auth Unification** - Remove Supabase from AuthContext, use JWT only
2. **API Token Attachment** - Ensure all API calls include JWT
3. **Backend Integration** - Wire frontend components to backend routes
4. **Error Handling** - Consistent error handling across all API calls
5. **Loading States** - Add loading indicators where needed
6. **Responsive Design** - Mobile/tablet/desktop layouts

## Next Steps

Starting Phase 1: Auth & Master Login
- Unify authentication system
- Verify owner user seeding
- Test complete login flow





