# ⚠️ LEGACY CODE - DEPRECATED

> **Last Updated:** December 5, 2025  
> **Status:** DEPRECATED - Do not use for new development

---

## What is "Legacy Code"?

The following directories contain legacy code that has been migrated to the new `/backend/src/` architecture:

| Directory | Status | Replacement |
|-----------|--------|-------------|
| `/backend/routes/` | 🔴 Deprecated | `/backend/src/api/routes/` |
| `/backend/controllers/` | 🔴 Deprecated | `/backend/src/api/controllers/` |
| `/backend/models/` | 🔴 Deprecated | `/backend/src/domain/models/` |
| `/backend/services/` | 🔴 Deprecated | `/backend/src/services/` |
| `/backend/sockets/` | 🔴 Deprecated | `/backend/src/sockets/` |
| `/backend/config/` | 🟡 Partially | `/backend/src/config/` |

---

## Why Keep These Files?

These files are kept temporarily for:

1. **Backwards Compatibility** - Some routes are still mounted for legacy API consumers
2. **Reference** - To compare behavior during migration verification
3. **Fallback** - In case of issues with the new architecture

---

## Removal Timeline

These files will be **removed** after:

1. ✅ New architecture is verified working in production for 2 weeks
2. ✅ All API consumers have been updated to use new endpoints
3. ✅ All integration tests pass with new routes
4. ✅ No 500 errors from new route handlers in production logs

**Target Removal Date:** After production stabilization (estimated 2 weeks post-deploy)

---

## DO NOT:

❌ Add new features to legacy files  
❌ Import from legacy directories in new code  
❌ Modify legacy files except for critical bug fixes  
❌ Create new files in legacy directories

---

## DO:

✅ Add new features to `/backend/src/`  
✅ Import from `/backend/src/domain/models/` for models  
✅ Import from `/backend/src/services/` for business logic  
✅ Create new routes in `/backend/src/api/routes/`  
✅ Run tests before committing: `npm test`

---

## New Architecture Overview

```
/backend/src/
├── api/
│   ├── routes/       ← HTTP route definitions
│   ├── controllers/  ← Request handlers
│   └── middleware/   ← Auth, validation, rate limiting
├── domain/
│   ├── models/       ← Mongoose schemas
│   └── repositories/ ← Data access layer
├── services/         ← Business logic
├── sockets/          ← WebSocket handlers
├── loaders/          ← Express, Socket.IO, Jobs setup
├── config/           ← Environment, logging, DB
├── utils/            ← Shared utilities
└── tests/            ← Test suite
```

---

## Migration Documentation

See `/backend/MIGRATION_NOTES.md` for detailed migration documentation.

---

## Questions?

Contact the engineering team if you need to:
- Modify legacy code for a critical fix
- Understand the migration strategy
- Add a new feature (use new architecture!)

