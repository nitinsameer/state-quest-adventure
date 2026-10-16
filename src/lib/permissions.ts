/**
 * DEPRECATED: Storage Permission Handler & File Save
 *
 * These functions have been removed as of the postcard permission cleanup.
 * Postcards are now stored exclusively in the app's private library via in-app storage.
 * No WRITE_EXTERNAL_STORAGE permission is requested. Native sharing is handled by
 * src/lib/share-postcard.ts via the Android share sheet (parent-gated).
 *
 * This file is kept for now but contains no exported functions.
 * It may be deleted in a future cleanup pass.
 */
