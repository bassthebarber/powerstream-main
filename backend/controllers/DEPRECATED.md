# ⚠️ DEPRECATED DIRECTORY

> **This directory is part of the LEGACY architecture.**

All controllers in this directory are being migrated to `/backend/src/api/controllers/`.

## DO NOT:
- Add new controllers here
- Modify existing controllers (unless fixing critical bugs)
- Import from these files in new code

## Instead:
- Add new controllers to `/backend/src/api/controllers/`
- Import controllers from the new location

## Migration Status
Controllers are being migrated feature by feature. See `/backend/MIGRATION_NOTES.md` for details.

## Removal Timeline
These files will be removed after production is confirmed stable with the new architecture.
