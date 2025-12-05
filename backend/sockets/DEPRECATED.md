# ⚠️ DEPRECATED DIRECTORY

> **This directory is part of the LEGACY architecture.**

All socket handlers in this directory are being migrated to `/backend/src/sockets/`.

## DO NOT:
- Add new socket handlers here
- Modify existing handlers (unless fixing critical bugs)
- Import from these files in new code

## Instead:
- Add new socket handlers to `/backend/src/sockets/`
- Wire them through `/backend/src/loaders/socket.js`

## Migration Status
Socket handlers are being migrated. See `/backend/MIGRATION_NOTES.md` for details.

## Removal Timeline
These files will be removed after production is confirmed stable with the new architecture.
