/**
 * DEPRECATED: Storage Permission Handler & File Save
 *
 * These functions have been removed as of the postcard permission cleanup.
 * Postcards are now stored exclusively in the app's private library via in-app storage.
 * No WRITE_EXTERNAL_STORAGE permission is requested. Native sharing is handled by
 * src/lib/share-postcard.ts via the Android share sheet (parent-gated).
 *
 * P1.6 fix: Added stub functions to prevent "cannot find name" errors
 * These are no-ops that allow code to compile while export functionality
 * is gracefully degraded (not broken).
 */

/**
 * Stub: Request storage permission
 * No longer needed - using app-private storage instead
 */
export async function requestStoragePermission(): Promise<boolean> {
  console.warn("[permissions] requestStoragePermission is deprecated - using app-private storage");
  return false;
}
