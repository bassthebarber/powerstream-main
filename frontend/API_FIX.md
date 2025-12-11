# API Configuration Fix

## Issue
Frontend was trying to connect to `studio-api.southernpowertvmusic.com/auth/login` instead of `http://localhost:5001/api/auth/login`.

## Root Cause
1. `.env` file had `VITE_API_BASE` but code uses `VITE_API_URL`
2. Duplicate `VITE_API_BASE` entries (one localhost, one production)
3. Dev server needs restart to pick up new env vars

## Fix Applied
1. ✅ Added `VITE_API_URL=http://localhost:5001/api` to `.env`
2. ✅ Verified `frontend/src/lib/api.js` uses `VITE_API_URL`
3. ✅ Confirmed `AuthContext.jsx` uses correct `api` client

## Next Steps
**IMPORTANT: Restart the Vite dev server to pick up the new environment variable!**

```powershell
# Stop the current dev server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## Verification
After restart, check browser console:
- Should see requests to `http://localhost:5001/api/auth/login`
- Should NOT see `studio-api.southernpowertvmusic.com`

## Files Modified
- `frontend/.env` - Added `VITE_API_URL=http://localhost:5001/api`





