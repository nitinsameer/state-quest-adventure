/**
 * Storage Permission Handler & File Save
 * Uses Capacitor Filesystem to save files with proper permission handling
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { App } from '@capacitor/app';

export async function requestStoragePermission(): Promise<boolean> {
  try {
    const capacitor = (window as any)?.Capacitor;
    if (!capacitor) {
      console.log('[Permissions] Web platform - no permission needed');
      return true;
    }

    const platform = capacitor.getPlatform?.();
    console.log('[Permissions] Platform:', platform);

    // Check localStorage consent first
    const hasConsent = localStorage.getItem(
      "india-explorer:file-permission-consent:v1"
    ) === "1";
    
    if (!hasConsent) {
      console.log('[Permissions] User has not given consent in dialog');
      return false;
    }

    console.log('[Permissions] User gave consent, requesting Android permissions...');

    // Request permissions at runtime
    if (platform === 'android') {
      try {
        console.log('[Permissions] Requesting WRITE_EXTERNAL_STORAGE and READ_EXTERNAL_STORAGE...');
        const result = await App.requestPermissions({
          permissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
        });
        console.log('[Permissions] Permission request result:', result);
        return true;
      } catch (err) {
        console.error('[Permissions] Permission request error:', err);
        return true; // Continue anyway, will use cache fallback
      }
    }

    return true;
  } catch (err) {
    console.error('[Permissions] Error:', err);
    return true;
  }
}

export async function saveFileToDownloads(blob: Blob, filename: string): Promise<boolean> {
  try {
    const capacitor = (window as any)?.Capacitor;
    const platform = capacitor?.getPlatform?.();

    console.log('[FileSystem] Attempting save:', { filename, platform, blobSize: blob.size });

    // On native platforms
    if (platform === 'android' || platform === 'ios') {
      try {
        // Convert blob to base64
        const base64data = await blobToBase64(blob);
        console.log('[FileSystem] Converted blob to base64, length:', base64data.length);

        // Try Documents directory first (Downloads folder)
        console.log('[FileSystem] Attempting to save to Documents/Downloads...');
        try {
          const result = await Filesystem.writeFile({
            path: filename,
            data: base64data,
            directory: Directory.Documents,
            recursive: true,
          });
          
          console.log('[FileSystem] File saved successfully to Documents:', result);
          return true;
        } catch (docsErr: any) {
          console.log('[FileSystem] Documents save failed:', docsErr?.message);
          console.log('[FileSystem] Trying cache as fallback...');
          
          // Fallback to cache directory
          const cacheResult = await Filesystem.writeFile({
            path: filename,
            data: base64data,
            directory: Directory.Cache,
            recursive: true,
          });
          console.log('[FileSystem] File saved to cache (fallback):', cacheResult);
          return true;
        }
      } catch (err) {
        console.error('[FileSystem] All native save methods failed:', err);
        // Fall through to web method
      }
    }

    // Web fallback - use browser download
    console.log('[FileSystem] Using web fallback - blob download');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('[FileSystem] Web download triggered');
    return true;
  } catch (err) {
    console.error('[FileSystem] Error saving file:', err);
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
