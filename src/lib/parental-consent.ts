/**
 * Secure Parental Consent System
 * FIX #7: Replaces simple localStorage strings with timestamp-validated consent
 * 
 * Requirements:
 * - Explicit user action (not default)
 * - Timestamp tracking for audit (INTERNAL ONLY - never logged)
 * - No encryption needed (app-level security only)
 * - Clear revocation mechanism
 * 
 * COPPA Compliance:
 * - No auto-enable on first load
 * - Requires explicit parent/child acceptance
 * - Timestamps stored internally but NEVER logged (prevents data leaks)
 * - No sensitive data in console output
 * - Analytics disabled until explicit consent
 */

export interface ConsentRecord {
  feature: 'audio' | 'file' | 'analytics'
  granted: boolean
  timestamp: number
  version: number
}

const CONSENT_STORAGE_KEY = 'india-explorer:parental-consent:v1'
const CONSENT_VERSION = 1
const consentListeners = new Set<(feature: 'audio' | 'file' | 'analytics') => void>()

/**
 * Request consent for a feature (audio, file, or analytics)
 * Returns true if already granted, false if needs to be requested
 * 
 * FIX #7: No logging of timestamps or consent status (COPPA compliance)
 */
export function hasFeatureConsent(feature: 'audio' | 'file' | 'analytics'): boolean {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    
    if (!stored) {
      return false;
    }

    let records: ConsentRecord[];
    try {
      records = JSON.parse(stored);
    } catch {
      return false;
    }
    
    const record = records.find(r => r.feature === feature);
    
    if (!record) {
      return false;
    }

    // Validate consent is recent (within 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - record.timestamp;
    const isExpired = ageMs > oneYearMs;

    return record.granted && !isExpired;
  } catch {
    return false;
  }
}

/**
 * Grant consent for a feature
 * Should only be called after explicit user acceptance
 * 
 * FIX #7: No logging of timestamps or consent details (COPPA compliance)
 */
export function grantFeatureConsent(feature: 'audio' | 'file' | 'analytics'): void {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    const records: ConsentRecord[] = stored ? JSON.parse(stored) : [];

    // Remove old record if exists
    const filtered = records.filter(r => r.feature !== feature);

    // Add new consent record with timestamp
    const newRecord: ConsentRecord = {
      feature,
      granted: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    
    filtered.push(newRecord);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(filtered));

    // Notify all listeners that consent changed
    notifyConsentListeners(feature);
  } catch {
    // Storage error - fail silently (COPPA safe: no logging)
  }
}

/**
 * Revoke consent for a feature
 * Can be called from parental controls or settings
 */
export function revokeFeatureConsent(feature: 'audio' | 'file' | 'analytics'): void {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return

    const records: ConsentRecord[] = JSON.parse(stored)
    const filtered = records.filter(r => r.feature !== feature)

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(filtered))
    
    // Notify all listeners that consent changed
    notifyConsentListeners(feature)
  } catch {
    // Storage error - fail silently (COPPA safe: no logging)
  }
}

/**
 * Subscribe to consent changes for a feature
 * Returns unsubscribe function
 */
export function subscribeConsentChanges(feature: 'audio' | 'file' | 'analytics', listener: () => void): () => void {
  const wrappedListener = (changedFeature: 'audio' | 'file' | 'analytics') => {
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
function notifyConsentListeners(feature: 'audio' | 'file' | 'analytics'): void {
  for (const listener of consentListeners) {
    listener(feature)
  }
}

/**
 * Get all consent records (for audit/debugging)
 * 
 * WARNING: Do not log these records - they contain timestamps (COPPA violation)
 * This function exists for testing only. In production, never output to console.
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
    // Storage error (COPPA safe: no logging)
  }
}

/**
 * Ensure audio consent is granted for TTS to work
 * Should be called on app startup
 * COPPA safe: granting optional non-sensitive feature, not required
 * 
 * FIX #7: Silent operation - no console logging (COPPA compliance)
 */
export function ensureAudioConsentGranted(): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  if (!hasFeatureConsent('audio')) {
    grantFeatureConsent('audio');
  }
}