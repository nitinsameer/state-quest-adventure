/**
 * Share Postcard Utility
 *
 * Handles native sharing via Android share sheet (Capacitor v6) with web fallback.
 * For kids' app (COPPA-compliant): sharing is gated behind parent verification.
 *
 * - Native (isNativePlatform): writes to cache, gets URI, calls Share.share()
 * - Web fallback: anchor download
 * - Treats user cancellation as normal outcome (not error)
 * - Cleans up cache file after sharing when feasible
 */

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export interface SharePostcardResult {
  ok: boolean;
  cancelled?: boolean;
  error?: string;
}

/**
 * Convert Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove "data:image/png;base64," prefix if present
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Share a postcard via native share sheet (Android) or download (web).
 *
 * @param blob - PNG image blob
 * @param filename - Suggested filename for saved/shared postcard
 * @returns Promise with result { ok: boolean; cancelled?: boolean; error?: string }
 */
export async function sharePostcard(blob: Blob, filename: string): Promise<SharePostcardResult> {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback: anchor download
      return sharePostcardWeb(blob, filename);
    }

    // Native path: write to cache, get URI, share
    return await sharePostcardNative(blob, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sharePostcard] Unexpected error:", error);
    return {
      ok: false,
      error: message,
    };
  }
}

/**
 * Native implementation: write to cache, get URI, call Share.share()
 */
async function sharePostcardNative(blob: Blob, filename: string): Promise<SharePostcardResult> {
  let cacheFilePath: string | undefined;

  try {
    // Step 1: Convert blob to base64
    const base64 = await blobToBase64(blob);

    // Step 2: Write to cache directory
    cacheFilePath = `${filename}.png`;
    await Filesystem.writeFile({
      directory: Directory.Cache,
      path: cacheFilePath,
      data: base64,
    });

    // Step 3: Get URI for the cache file
    const fileUri = await Filesystem.getUri({
      directory: Directory.Cache,
      path: cacheFilePath,
    });

    // Step 4: Call Share.share() with the file URI
    await Share.share({
      title: "Share postcard",
      files: [fileUri.uri],
    });

    // Success: user completed share (or cancelled, but we treat as ok)
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Check if user cancelled the share sheet
    if (message.includes("cancel") || message.includes("Cancel") || message.includes("user")) {
      return { ok: true, cancelled: true };
    }

    console.error("[sharePostcardNative] Error:", error);
    return {
      ok: false,
      error: message,
    };
  } finally {
    // Step 5: Try to delete cache file (non-critical, fail silently)
    if (cacheFilePath) {
      try {
        await Filesystem.deleteFile({
          directory: Directory.Cache,
          path: cacheFilePath,
        });
      } catch {
        // Silently ignore deletion errors
      }
    }
  }
}

/**
 * Web fallback: create anchor element and trigger download
 */
function sharePostcardWeb(blob: Blob, filename: string): SharePostcardResult {
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[sharePostcardWeb] Error:", error);
    return {
      ok: false,
      error: message,
    };
  }
}
