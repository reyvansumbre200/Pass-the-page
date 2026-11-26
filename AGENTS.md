# Pass the Page data preservation

`books.json` and `photos/` are production content managed by the admin page, not sample fixtures. Preserve all book IDs, photos, prices, statuses, notes, settings and donation records unless the user explicitly asks to change them.

For code-only releases, commit changes, then run `node scripts/safe-push.cjs`. It fetches the latest admin updates, creates a verified local Git bundle backup, rebases code onto those updates, verifies the data and photo blobs are identical, and pushes without force. Stop on conflicts. Never force-push, reset the remote branch, or replace the catalogue with fixtures. A failed network operation is not proof of synchronization.

Run `node scripts/check-enhancements.cjs` and `node scripts/check-data-safety.cjs` when changing saving or release behavior. Tests use isolated temporary repositories and mocked GitHub requests, never production writes.
