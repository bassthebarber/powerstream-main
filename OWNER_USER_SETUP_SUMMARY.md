# Owner User Setup - Summary

## Files Created/Modified

### Backend

1. **`backend/scripts/ensureOwnerUser.js`** (NEW)
   - Seed script that ensures `Bassbarberbeauty@gmail.com` user exists
   - Creates user if it doesn't exist
   - Updates password if user exists (ensures password is always `Chinamoma$59`)
   - Uses case-insensitive email lookup
   - User details:
     - Email: `Bassbarberbeauty@gmail.com` (stored as lowercase: `bassbarberbeauty@gmail.com`)
     - Name: `Marcus`
     - Password: `Chinamoma$59` (hashed by User model pre-save hook)
     - Role: `admin` (since "owner" is not in the User model enum)
     - Status: `active`
     - isAdmin: `true`
     - isVerified: `true`

2. **`backend/routes/authRoutes.js`** (UPDATED)
   - Added case-insensitive email normalization: `email.toLowerCase().trim()`
   - Added login attempt logging: `console.log("[LOGIN] attempt", normalizedEmail)`
   - Email is already stored in lowercase due to User schema `lowercase: true`

3. **`backend/server.js`** (UPDATED)
   - Added automatic owner user seeding on server startup
   - Runs after admin user seeding
   - Ensures owner user exists before server accepts connections

### Frontend

4. **`frontend/src/pages/LoginPage.jsx`** (VERIFIED)
   - Already using correct API endpoint: `api.post("/auth/login", { email, password })`
   - No Supabase code present
   - Uses `api` from `../lib/api.js` which has baseURL from `VITE_API_URL`

5. **`frontend/src/lib/api.js`** (VERIFIED)
   - Correctly configured with `baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"`

## How to Run the Seed Script

### Manual Run (One-time)
```bash
cd backend
node scripts/ensureOwnerUser.js
```

Expected output:
- `✅ Connected to MongoDB`
- `✅ Created owner user: bassbarberbeauty@gmail.com` (if new)
  OR
- `✅ Updated owner user password: bassbarberbeauty@gmail.com` (if existing)
- `   Password: Chinamoma$59`
- `✅ Disconnected from MongoDB`

### Automatic Run (On Server Start)
The seed script now runs automatically when you start the backend server:
```bash
cd backend
npm start
```

Look for these messages in the console:
- `✅ Created admin user: admin@powerstream.com` (or "already exists")
- `✅ Created owner user: bassbarberbeauty@gmail.com` (or "Updated owner user password")

## Testing Login

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   - Verify you see: `✅ Created owner user: bassbarberbeauty@gmail.com` or `✅ Updated owner user password`
   - Verify server is listening: `🚀 PowerStream API listening at http://127.0.0.1:5001`

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   - Should start on `http://localhost:5173`

3. **Test Login:**
   - Visit `http://localhost:5173`
   - Click any protected route (e.g., PowerFeed)
   - Should redirect to `/login`
   - Enter credentials:
     - **Email:** `Bassbarberbeauty@gmail.com` (case doesn't matter)
     - **Password:** `Chinamoma$59`
   - Click "Sign In"
   - Should redirect to `/powerfeed` and show authenticated content

4. **Verify in Backend Console:**
   - Look for: `[LOGIN] attempt bassbarberbeauty@gmail.com`
   - Should see successful login (no errors)

5. **Verify Token Storage:**
   - Open browser DevTools → Application → Local Storage
   - Should see `powerstream_token` with a JWT value

## Case-Insensitive Email Handling

- **User Model:** Email field has `lowercase: true`, so all emails are stored in lowercase
- **Login Route:** Normalizes incoming email with `email.toLowerCase().trim()` before lookup
- **Seed Script:** Uses `toLowerCase()` when searching/creating users
- **Result:** You can log in with `Bassbarberbeauty@gmail.com`, `BASSBARBERBEAUTY@GMAIL.COM`, or any case variation

## Troubleshooting

- **"Login failed. Please try again."**
  - Check backend console for `[LOGIN] attempt` log
  - Verify backend is running on port 5001
  - Check `VITE_API_URL` in `frontend/.env` matches backend URL
  - Verify MongoDB connection in backend console
  - Run seed script manually: `cd backend && node scripts/ensureOwnerUser.js`

- **"Invalid credentials"**
  - Verify user was created: Check backend console for seed messages
  - Check password is correct: `Chinamoma$59` (case-sensitive)
  - Check email is correct: `Bassbarberbeauty@gmail.com` (case doesn't matter for email)

- **User not found**
  - Run seed script manually to ensure user exists
  - Check MongoDB connection
  - Verify email in database is lowercase: `bassbarberbeauty@gmail.com`

- **Password mismatch**
  - Seed script updates password on each run, so password should always be `Chinamoma$59`
  - If still failing, run seed script again to reset password

## Notes

- The User model's `role` enum only includes: `["admin", "finance", "legal", "investor", "user"]`
- Since "owner" is not in the enum, the owner user is created with `role: "admin"`
- The email is always stored in lowercase in the database due to the schema
- Login is case-insensitive for email but case-sensitive for password
- The seed script runs automatically on server start, so the owner user is always available





