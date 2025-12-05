# PowerStream Platform

A comprehensive social media, streaming, and AI-powered content creation platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Environment variables configured

### Backend Setup

```bash
cd backend
npm install
cp .env.local.example .env.local
# Edit .env.local with your MongoDB credentials and JWT_SECRET
npm start
```

The backend will:
- Auto-seed owner user: `Bassbarberbeauty@gmail.com` / `Chinamoma$59`
- Auto-seed admin user: `admin@powerstream.com` / `PowerStream123!`
- Start on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:5001/api
npm run dev
```

Frontend runs on `http://localhost:5173`

### Recording Studio (Optional)

The Recording Studio server runs separately on port 5100:

```bash
cd backend/recordingStudio
npm install
# Configure .env
npm start
```

## 📁 Project Structure

```
PowerStreamMain/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   ├── context/    # React contexts (Auth)
│   │   ├── lib/        # API clients
│   │   └── styles/     # CSS files
│   └── public/         # Static assets
│
├── backend/            # Node.js + Express API
│   ├── routes/         # API route handlers
│   ├── controllers/    # Business logic
│   ├── models/         # Mongoose models
│   ├── middleware/     # Auth, validation
│   └── scripts/        # Seed scripts
│
└── backend/recordingStudio/  # Recording Studio server
    ├── routes/         # Studio-specific routes
    ├── controllers/    # Studio controllers
    └── ai/             # AI beat/mix engines
```

## 🔐 Authentication

### Default Accounts

**Owner Account:**
- Email: `Bassbarberbeauty@gmail.com`
- Password: `Chinamoma$59`
- Role: Admin

**Admin Account:**
- Email: `admin@powerstream.com`
- Password: `PowerStream123!`
- Role: Admin

### JWT Authentication

All API calls automatically include JWT tokens via the `api` client. Protected routes require authentication.

## 🎯 Features

### ✅ Completed
- **Authentication** - JWT-based login/register
- **Home/Launchpad** - Spinning logo, welcome audio, navigation
- **Global Navigation** - Top bar with user menu
- **PowerFeed** - Facebook-style social feed
- **PowerGram** - Instagram-style photo grid
- **PowerReel** - TikTok-style vertical video feed
- **PowerLine** - Messenger-style chat
- **TV Stations** - Station hub and detail pages
- **PS TV** - Netflix-style content catalog
- **AI Studio** - Beat generation, export, send to PowerStream
- **AI Brain** - Command interface for system control

### 🔄 In Progress
- Real-time Socket.io integration
- Advanced AI Studio features
- Payment/monetization

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Social Features
- `GET /api/powerfeed/posts` - List posts
- `POST /api/powerfeed/posts` - Create post
- `POST /api/powerfeed/posts/:id/react` - Like post
- `POST /api/powerfeed/posts/:id/comment` - Comment

### Media
- `GET /api/powergram` - List grams
- `GET /api/powerreel` - List reels
- `POST /api/powergram/:id/like` - Like gram
- `POST /api/powerreel/:id/like` - Like reel

### Chat
- `GET /api/powerline/conversations` - List conversations
- `GET /api/powerline/messages/:id` - Get messages
- `POST /api/powerline/messages/:id` - Send message

### TV & Streaming
- `GET /api/tv-stations` - List stations
- `GET /api/tv-stations/:slug` - Get station
- `GET /api/ps-tv/titles` - List PS TV titles

### AI Studio
- `POST /api/studio/activate` - Activate AI Studio
- `POST /api/studio/sequence` - Run mixing sequence
- `POST /api/studio/export` - Export project
- `POST /api/studio/ai/generate-beat` - Generate AI beat

### AI Brain
- `GET /api/brain/health` - Health check
- `POST /api/brain/task` - Submit task
- `POST /api/commands/run` - Run command
- `POST /api/copilot/command` - Copilot command

## 🎨 Theme

The platform uses a black + gold theme:

```css
--bg: #000
--panel: #0f0f10
--text: #fff
--muted: #888
--gold: #e6b800
--gold-soft: #ffda5c
```

## 🔧 Environment Variables

### Backend (.env.local)
```env
MONGO_URI=mongodb+srv://...
# OR
MONGO_USER=...
MONGO_PASS=...
MONGO_HOST=...
MONGO_DB=powerstream

JWT_SECRET=your-secret-key-change-in-production
PORT=5001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001/api
VITE_STUDIO_API_URL=http://localhost:5100/api
```

## 🧪 Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:5173`
4. Login with owner/admin credentials
5. Test features:
   - Create posts in PowerFeed
   - Upload photos to PowerGram
   - Watch reels in PowerReel
   - Send messages in PowerLine
   - Browse TV stations
   - Generate beats in AI Studio

## 📝 Development

### Adding New Features

1. Create backend route in `backend/routes/`
2. Create controller in `backend/controllers/`
3. Create model if needed in `backend/models/`
4. Create frontend page in `frontend/src/pages/`
5. Add route to `frontend/src/App.jsx`
6. Use `api` client for API calls

### Code Style

- Use ES modules (import/export)
- Follow existing patterns
- Use `api` client for all API calls
- Use `useAuth()` for user context
- Use CSS variables for theming

## 🚢 Deployment

For detailed production deployment instructions, see **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**.

### Quick Overview

**Backend:**
- Set production `MONGO_URI` and strong `JWT_SECRET`
- Configure CORS for production domain
- Use PM2 for process management: `pm2 start server.js --name powerstream-api`
- See `backend/env.example.txt` for all available environment variables

**Frontend:**
- Build: `npm run build`
- Deploy `dist/` folder to web server or CDN
- Set production `VITE_API_URL`
- See `frontend/env.example.txt` for all available environment variables

**RTMP Streaming:**
- Port 1935 for RTMP ingest
- Port 8000 for HTTP-FLV playback
- See [DEPLOYMENT.md](./docs/DEPLOYMENT.md#rtmp-streaming-setup) for firewall setup

## 📄 License

Proprietary - PowerStream Platform

## 🤝 Support

For issues or questions, contact the development team.

---

**Built with:** React, Node.js, Express, MongoDB, JWT, Axios



