/**
 * Storage Permission Handler & File Save
 * Uses Capacitor Filesystem to save files with proper permission handling
 * 
 * FIX #6 & #22: Console logging removed - only debug mode logging
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { debugLog, debugError } from './debug';

export async function requestStoragePermission(): Promise<boolean> {
  try {
    const capacitor = (window as any)?.Capacitor;
    if (!capacitor) {
      return true;
    }

    const platform = capacitor.getPlatform?.();

    // Check localStorage consent first
    const hasConsent = localStorage.getItem(
      "india-explorer:file-permission-consent:v1"
    ) === "1";
    
    if (!hasConsent) {
      // FIX #28: Fail loud - user will see error message
      return false;
    }

    debugLog("permissions", "User gave consent, requesting Android permissions");

    // Request permissions at runtime
    if (platform === 'android') {
      try {
        debugLog("permissions", "Requesting WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE");
        const result = await App.requestPermissions({
          permissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
        });
        debugLog("permissions", "Permission request result", result);
        return true;
      } catch (err) {
        debugError("permissions", "Permission request failed - user may have declined", err);
        // FIX #28: Fail loud - return false so UI can show error
        return false;
      }
    }

    return true;
  } catch (err) {
    debugError("permissions", "Error", err);
    return false; // FIX #28: Fail loud instead of silently continuing
  }
}

export async function saveFileToDownloads(blob: Blob, filename: string): Promise<boolean> {
  try {
    const capacitor = (window as any)?.Capacitor;
    const platform = capacitor?.getPlatform?.();

    debugLog("filesystem", "Attempting save", { filename, platform, blobSize: blob.size });

    // On native platforms
    if (platform === 'android' || platform === 'ios') {
      try {
        // Convert blob to base64
        const base64data = await blobToBase64(blob);
        debugLog("filesystem", "Converted blob to base64", { length: base64data.length });

        // Try Documents directory first (Downloads folder)
        debugLog("filesystem", "Attempting to save to Documents/Downloads");
        try {
          const result = await Filesystem.writeFile({
            path: filename,
            data: base64data,
            directory: Directory.Documents,
            recursive: true,
          });
          
          debugLog("filesystem", "File saved successfully to Documents", result);
          return true;
        } catch (docsErr: any) {
          debugLog("filesystem", "Documents save failed", { message: docsErr?.message });
          debugLog("filesystem", "Trying cache as fallback");
          
          // Fallback to cache directory
          const cacheResult = await Filesystem.writeFile({
            path: filename,
            data: base64data,
            directory: Directory.Cache,
            recursive: true,
          });
          debugLog("filesystem", "File saved to cache (fallback)", cacheResult);
          return true;
        }
      } catch (err) {
        debugError("filesystem", "All native save methods failed", err);
        // Fall through to web method
      }
    }

    // Web fallback - use browser download
    debugLog("filesystem", "Using web fallback - blob download");
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    debugLog("filesystem", "Web download triggered");
    return true;
  } catch (err) {
    debugError("filesystem", "Error saving file", err);
    return false;
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // Remove data:image/png;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
