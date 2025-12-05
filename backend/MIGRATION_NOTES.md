# PowerStream Backend Migration Notes

> **Last Updated:** December 5, 2025  
> **Status:** Final Lock-In Mode - Active Migration

---

## Overview

PowerStream is migrating from a legacy flat architecture to a modern, layered architecture under `/backend/src/`. This document summarizes the migration status, entry points, and guidelines for developers.

---

## Architecture Comparison

### Legacy Architecture (Being Deprecated)
```
/backend/
  /routes/          ← 104 route files (DEPRECATED)
  /controllers/     ← 72 controller files (DEPRECATED)
  /models/          ← 80+ model files (DEPRECATED)
  /services/        ← 36 service files (DEPRECATED)
  /sockets/         ← 15 socket files (DEPRECATED)
  /config/          ← Mixed config (DEPRECATED)
  server.js         ← Legacy entry point
```

### New Architecture (Production Target)
```
/backend/src/
  /api/
    /routes/        ← Canonical HTTP routes
    /controllers/   ← Clean controller layer
    /middleware/    ← Auth, rate-limit, validation, etc.
  /domain/
    /models/        ← Mongoose schemas (13 models)
    /repositories/  ← Data access layer (8 repos)
  /services/        ← Business logic (14 services)
  /sockets/         ← WebSocket handlers
  /loaders/         ← Express, Socket.IO, Jobs init
  /config/          ← Centralized config (env.js, logger, etc.)
  /ml/              ← ML service + client
  /utils/           ← Shared utilities
  /tests/           ← Test suite
  server.js         ← New entry point
  app.js            ← Express factory
```

---

## What's Being Migrated

### Phase 1: Models & Repositories
- Replace ~175 imports from `/backend/models/` with `/backend/src/domain/models/`
- Wire repositories for data access abstraction

### Phase 2: Services
- Wire legacy controllers to use `/src/services/` instead of legacy services or direct model access

### Phase 3: Routes & Controllers
- Create canonical routes in `/src/api/routes/`
- Create canonical controllers in `/src/api/controllers/`
- Mount through `/src/loaders/express.js`
- Disable legacy route mounts

### Phase 4: Sockets
- Migrate socket handlers to `/src/sockets/`
- Wire through `/src/loaders/socket.js`

### Phase 5: Configuration
- Reduce `process.env` direct usage
- Centralize through `/src/config/env.js`

---

## New Entry Points

| Purpose | New Location | Notes |
|---------|--------------|-------|
| Server start | `/backend/src/server.js` | Use this for production |
| Express app | `/backend/src/app.js` | Factory for testing |
| Routes mount | `/backend/src/loaders/express.js` | All API routes |
| Sockets mount | `/backend/src/loaders/socket.js` | All WebSocket namespaces |
| Config | `/backend/src/config/env.js` | Single source of truth |

---

## Developer Guidelines

### ⚠️ DO NOT:
- Add new features to `/backend/routes/`, `/backend/controllers/`, etc.
- Import models from `/backend/models/` - use `/backend/src/domain/models/`
- Use `process.env` directly - use `/backend/src/config/env.js`
- Add new sockets to `/backend/sockets/` - use `/backend/src/sockets/`

### ✅ DO:
- Add new routes to `/backend/src/api/routes/`
- Add new controllers to `/backend/src/api/controllers/`
- Add new services to `/backend/src/services/`
- Use repositories for data access
- Run tests before committing: `npm test`

---

## Legacy File Status

All files in these directories are **DEPRECATED** but **NOT YET DELETED**:

| Directory | Status | Removal Target |
|-----------|--------|----------------|
| `/backend/routes/` | Deprecated | After production stabilization |
| `/backend/controllers/` | Deprecated | After production stabilization |
| `/backend/models/` | Deprecated | After production stabilization |
| `/backend/services/` | Deprecated | After production stabilization |
| `/backend/sockets/` | Deprecated | After production stabilization |

Legacy files will be removed after a 2-week grace period once production is confirmed stable.

---

## Testing

Run the test suite:
```bash
cd backend
npm test
```

Run specific test files:
```bash
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=feed
```

---

## Questions?

Contact the engineering team or check the main `/docs/DEPLOYMENT.md` for production setup instructions.
