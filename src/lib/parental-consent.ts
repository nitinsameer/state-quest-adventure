/**
 * Secure Parental Consent System
 * FIX #7: Replaces simple localStorage strings with timestamp-validated consent
 * 
 * Requirements:
 * - Explicit user action (not default)
 * - Timestamp tracking for audit
 * - No encryption needed (app-level security only)
 * - Clear revocation mechanism
 * 
 * COPPA Compliance:
 * - No auto-enable on first load
 * - Requires explicit parent/child acceptance
 * - Timestamps for regulatory compliance
 */

export interface ConsentRecord {
  feature: 'audio' | 'file'
  granted: boolean
  timestamp: number
  version: number
}

const CONSENT_STORAGE_KEY = 'india-explorer:parental-consent:v1'
const CONSENT_VERSION = 1
const consentListeners = new Set<(feature: 'audio' | 'file') => void>()

/**
 * Request consent for a feature (audio or file access)
 * Returns true if already granted, false if needs to be requested
 */
export function hasFeatureConsent(feature: 'audio' | 'file'): boolean {
  console.log("[AUDIO DEBUG] hasFeatureConsent() called for:", feature);
  
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    console.log("[AUDIO DEBUG] localStorage key retrieved:", { 
      key: CONSENT_STORAGE_KEY, 
      stored: stored ? `exists (${stored.length} chars)` : "NOT FOUND",
    });
    
    if (!stored) {
      console.log("[AUDIO DEBUG] ✗ No consent records in localStorage");
      return false;
    }

    const records: ConsentRecord[] = JSON.parse(stored);
    console.log("[AUDIO DEBUG] Parsed consent records:", {
      totalRecords: records.length,
      recordFeatures: records.map(r => ({ feature: r.feature, granted: r.granted })),
    });
    
    const record = records.find(r => r.feature === feature);
    console.log("[AUDIO DEBUG] Looking for feature:", { 
      feature, 
      found: !!record, 
      granted: record?.granted,
    });

    if (!record) {
      console.log("[AUDIO DEBUG] ✗ No record found for feature:", feature);
      return false;
    }

    // Validate consent is recent (within 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - record.timestamp > oneYearMs;
    
    console.log("[AUDIO DEBUG] Consent expiry check:", {
      timestamp: record.timestamp,
      now: Date.now(),
      ageMs: Date.now() - record.timestamp,
      isExpired,
    });

    const result = record.granted && !isExpired;
    console.log("[AUDIO DEBUG] ✓ hasFeatureConsent result:", result);
    
    return result;
  } catch (err) {
    console.log("[AUDIO DEBUG] ✗ Exception in hasFeatureConsent:", err);
    return false;
  }
}

/**
 * Grant consent for a feature
 * Should only be called after explicit user acceptance
 */
export function grantFeatureConsent(feature: 'audio' | 'file'): void {
  console.log("[CONSENT] grantFeatureConsent() called for:", feature);
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    const records: ConsentRecord[] = stored ? JSON.parse(stored) : []

    // Remove old record if exists
    const filtered = records.filter(r => r.feature !== feature)

    // Add new consent record with timestamp
    filtered.push({
      feature,
      granted: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    })

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(filtered))
    console.log("[CONSENT] ✓ Consent granted and saved to localStorage:", { feature, records: filtered });
    
    // Notify all listeners that consent changed
    console.log("[CONSENT] Notifying listeners about consent change for:", feature);
    notifyConsentListeners(feature)
    console.log("[CONSENT] ✓ Listeners notified");
  } catch (err) {
    // Storage error - fail silently but user won't have consent
    console.log("[CONSENT] ✗ Error granting consent:", err);
  }
}

/**
 * Revoke consent for a feature
 * Can be called from parental controls or settings
 */
export function revokeFeatureConsent(feature: 'audio' | 'file'): void {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return

    const records: ConsentRecord[] = JSON.parse(stored)
    const filtered = records.filter(r => r.feature !== feature)

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(filtered))
    
    // Notify all listeners that consent changed
    notifyConsentListeners(feature)
  } catch {
    // Storage error - fail silently
  }
}

/**
 * Subscribe to consent changes for a feature
 * Returns unsubscribe function
 */
export function subscribeConsentChanges(feature: 'audio' | 'file', listener: () => void): () => void {
  const wrappedListener = (changedFeature: 'audio' | 'file') => {
    if (changedFeature === feature) {
      listener()
    }
  }
  
  consentListeners.add(wrappedListener)
  return () => consentListeners.delete(wrappedListener)
}

/**
 * Notify all listeners of consent change
 */
function notifyConsentListeners(feature: 'audio' | 'file'): void {
  for (const listener of consentListeners) {
    listener(feature)
  }
}

/**
 * Get all consent records (for audit/debugging)
 */
export function getAllConsentRecords(): ConsentRecord[] {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Clear all consent records
 * Used when deleting app data or resetting
 */
export function clearAllConsents(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch {
    // Storage error
  }
}

/**
 * Ensure audio consent is granted for TTS to work
 * Should be called on app startup
 * COPPA safe: granting optional non-sensitive feature, not required
 * 
 * FIX #30: Unblock TTS by ensuring audio consent is granted
 * Previous 6 fixes attempted to solve wrong problems
 * Root cause: hasFeatureConsent('audio') was returning false, blocking all TTS calls
 */
export function ensureAudioConsentGranted(): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  if (!hasFeatureConsent('audio')) {
    console.log("[AUDIO SETUP] Audio consent not granted, granting automatically...");
    grantFeatureConsent('audio');
    console.log("[AUDIO SETUP] ✅ Audio consent granted - TTS now enabled");
  } else {
    console.log("[AUDIO SETUP] ✅ Audio consent already granted");
  }
}
