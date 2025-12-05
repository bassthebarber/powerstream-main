# ⚠️ DEPRECATED DIRECTORY

> **This directory is part of the LEGACY architecture.**

All services in this directory are being migrated to `/backend/src/services/`.

## DO NOT:
- Add new services here
- Modify existing services (unless fixing critical bugs)
- Import from these files in new code

## Instead:
- Add new services to `/backend/src/services/`
- Import services from the new location:
  ```javascript
  import { feedService, chatService } from '../src/services/index.js';
  ```

## Migration Status
Services are being migrated. See `/backend/MIGRATION_NOTES.md` for details.

## Canonical Services (use these):
- `auth.service.js`
- `feed.service.js`
- `media.service.js`
- `chat.service.js`
- `tv.service.js`
- `coins.service.js`
- `events.service.js`
- `recommendation.service.js`
- `brain.service.js`

## Removal Timeline
These files will be removed after production is confirmed stable with the new architecture.
