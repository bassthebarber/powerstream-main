# PowerStream Backend - Meta-Style Architecture

## Overview

This is the new Meta/TikTok-style architecture for PowerStream. The codebase is organized by feature/domain, with clear separation of concerns.

## Directory Structure

```
backend/
├── server.js              # Legacy entry point (still works)
├── package.json           # Updated with new dependencies
├── jsconfig.json          # Path aliases configuration
│
├── src/                   # NEW: Meta-style architecture
│   ├── server.js          # New entry point
│   ├── app.js             # Express app configuration
│   ├── index.js           # Main exports
│   │
│   ├── config/            # Centralized configuration
│   │   ├── env.js         # Environment variables
│   │   ├── db.mongo.js    # MongoDB connection
│   │   ├── redis.js       # Redis client + helpers
│   │   ├── logger.js      # Winston logger
│   │   └── cloudinary.js  # Media storage
│   │
│   ├── loaders/           # Service initialization
│   │   ├── express.js     # Middleware configuration
│   │   ├── socket.js      # Socket.IO namespaces
│   │   └── jobs.js        # BullMQ queues
│   │
│   ├── api/               # API layer
│   │   ├── routes/        # Route definitions
│   │   ├── controllers/   # Request handlers (TODO)
│   │   └── middleware/    # Auth, validation, etc.
│   │
│   ├── domain/            # Business logic
│   │   ├── models/        # Mongoose schemas
│   │   └── repositories/  # Data access layer
│   │
│   ├── services/          # Business services
│   │   ├── auth.service.js
│   │   ├── recommendation.service.js
│   │   ├── graph.service.js
│   │   └── events.service.js
│   │
│   ├── utils/             # Utilities
│   │   ├── errors.js      # Custom error classes
│   │   ├── pagination.js  # Pagination helpers
│   │   ├── ids.js         # ID generation
│   │   └── crypto.js      # Encryption helpers
│   │
│   └── ml/                # ML microservice
│       ├── client/        # Node.js client
│       └── python/        # Python service (Flask)
│
├── routes/                # LEGACY: Existing routes
├── controllers/           # LEGACY: Existing controllers
├── models/                # LEGACY: Existing models
└── services/              # LEGACY: Existing services
```

## Key Components

### 1. Configuration (`src/config/`)

- **env.js**: Centralized environment variable management
- **db.mongo.js**: MongoDB with retry logic and event handling
- **redis.js**: Redis client with caching and rate limiting helpers
- **logger.js**: Winston-based structured logging

### 2. Domain Models (`src/domain/models/`)

- **Event.model.js**: Unified event logging for analytics
- **Relationship.model.js**: Social graph (follow, friend, block)

### 3. Repositories (`src/domain/repositories/`)

Data access layer that abstracts database operations:
- `userRepository`
- `relationshipsRepository`
- `eventsRepository`

### 4. Services (`src/services/`)

Business logic layer:
- `authService`: Authentication (login, register, tokens)
- `recommendationService`: Content ranking (rule-based + ML)
- `graphService`: Social graph operations
- `eventsService`: Event logging and analytics

### 5. Middleware (`src/api/middleware/`)

- `auth.middleware.js`: JWT authentication + role-based access
- `error.middleware.js`: Global error handling
- `rateLimit.middleware.js`: Redis-based rate limiting
- `validate.middleware.js`: Request validation with Zod

### 6. ML Microservice (`src/ml/`)

Python Flask service for ML-powered features:
- Content ranking
- Similar content discovery
- User preference analysis
- Content moderation

## Running the Server

### Legacy Mode (existing code)
```bash
npm run dev         # Development with nodemon
npm start           # Production
```

### New Architecture
```bash
npm run dev:v2      # Development with new entry point
npm run start:v2    # Production with new entry point
```

### ML Service
```bash
cd src/ml/python
pip install -r requirements.txt
python main.py      # Runs on port 5200
```

## API Versioning

- `/api/*` - Legacy REST endpoints (v1)
- `/api/v2/*` - New architecture endpoints
- `/graphql` - GraphQL endpoint (placeholder)

## Event Types

All user actions are logged to the `events` collection:

```javascript
EVENT_TYPES = {
  // Views
  POST_VIEW, VIDEO_VIEW, REEL_VIEW, STORY_VIEW, PROFILE_VIEW,
  
  // Engagement
  LIKE, UNLIKE, COMMENT, SHARE, SAVE,
  
  // Social
  FOLLOW, UNFOLLOW, BLOCK, MESSAGE_SENT,
  
  // Monetization
  COIN_TIP, SUBSCRIPTION_START, PURCHASE,
  
  // Streaming
  STREAM_START, STREAM_END, STREAM_JOIN,
  
  // Studio
  TRACK_UPLOAD, BEAT_GENERATE, MIX_EXPORT
}
```

## Social Graph

Relationship types:
- `follow` - One-way following
- `friend` - Mutual following (auto-detected)
- `block` - Blocked user
- `mute` - Muted user

## Recommendations

The recommendation service uses a hybrid approach:

1. **Rule-based scoring**:
   - Freshness (time decay)
   - Engagement (likes, comments, shares)
   - Relationship strength (friends > following > discovery)

2. **ML-powered** (when available):
   - Personalized content ranking
   - Similar content discovery
   - User preference modeling

## Health Endpoints

- `GET /health` - Basic health check
- `GET /api/v2/health/detailed` - Full dependency check
- `GET /api/v2/health/ready` - Kubernetes readiness probe
- `GET /api/v2/health/live` - Kubernetes liveness probe

## Migration Guide

To migrate existing code to the new architecture:

1. Import from `src/index.js`:
   ```javascript
   import { authMiddleware, ApiError, logger } from './src/index.js';
   ```

2. Use repositories instead of direct model access:
   ```javascript
   // Old
   const user = await User.findById(id);
   
   // New
   import userRepository from './src/domain/repositories/user.repository.js';
   const user = await userRepository.findById(id);
   ```

3. Use services for business logic:
   ```javascript
   import authService from './src/services/auth.service.js';
   const result = await authService.login(email, password);
   ```

## Future Roadmap

1. **GraphQL Gateway** - Full schema implementation
2. **Microservices Split** - Separate deployable services
3. **Real ML Models** - PyTorch recommendation models
4. **Event Sourcing** - Full audit trail
5. **CQRS Pattern** - Separate read/write models



