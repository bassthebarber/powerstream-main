# ⚠️ DEPRECATED DIRECTORY

> **This directory is part of the LEGACY architecture.**

All models in this directory are being migrated to `/backend/src/domain/models/`.

## DO NOT:
- Add new models here
- Modify existing models (unless fixing critical bugs)
- Import from these files in new code

## Instead:
- Add new models to `/backend/src/domain/models/`
- Import models from the new location:
  ```javascript
  import { User, Post, Message } from '../src/domain/models/index.js';
  ```

## Migration Status
Models are being migrated. See `/backend/MIGRATION_NOTES.md` for details.

## Canonical Models (use these):
- `User` → `/src/domain/models/User.model.js`
- `Post` → `/src/domain/models/Post.model.js`
- `Message` → `/src/domain/models/Message.model.js`
- `Station` → `/src/domain/models/Station.model.js`
- `StreamSession` → `/src/domain/models/StreamSession.model.js`
- `CoinTransaction` → `/src/domain/models/CoinTransaction.model.js`
- `WithdrawalRequest` → `/src/domain/models/WithdrawalRequest.model.js`
- `Event` → `/src/domain/models/Event.model.js`
- `Relationship` → `/src/domain/models/Relationship.model.js`

## Removal Timeline
These files will be removed after production is confirmed stable with the new architecture.
