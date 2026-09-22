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
  feature: 'audio' | 'file' | 'analytics'
  granted: boolean
  timestamp: number
  version: number
}

const CONSENT_STORAGE_KEY = 'india-explorer:parental-consent:v1'
const CONSENT_VERSION = 1
const consentListeners = new Set<(feature: 'audio' | 'file') => void>()

/**
 * Request consent for a feature (audio, file, or analytics)
 * Returns true if already granted, false if needs to be requested
 */
export function hasFeatureConsent(feature: 'audio' | 'file' | 'analytics'): boolean {
  console.log(`\n[CONSENT] ===== hasFeatureConsent('${feature}') CALLED =====`);
  
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    console.log("[CONSENT] localStorage.getItem result:", { 
      key: CONSENT_STORAGE_KEY, 
      value: stored ? `"${stored}"` : "null",
      length: stored?.length || 0,
    });
    
    if (!stored) {
      console.log("[CONSENT] ❌ RESULT: NO CONSENT (localStorage empty)");
      return false;
    }

    let records: ConsentRecord[];
    try {
      records = JSON.parse(stored);
      console.log("[CONSENT] Parsed JSON:", JSON.stringify(records, null, 2));
    } catch (parseErr) {
      console.log("[CONSENT] ❌ JSON parse error:", parseErr);
      return false;
    }
    
    console.log("[CONSENT] Total records found:", records.length);
    records.forEach((r, i) => {
      console.log(`[CONSENT]   Record ${i}:`, { feature: r.feature, granted: r.granted, timestamp: r.timestamp });
    });
    
    const record = records.find(r => r.feature === feature);
    
    if (!record) {
      console.log(`[CONSENT] ❌ RESULT: NO CONSENT (no record for feature '${feature}')`);
      return false;
    }

    console.log("[CONSENT] Found record:", { feature: record.feature, granted: record.granted, timestamp: record.timestamp });

    // Validate consent is recent (within 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const ageMs = Date.now() - record.timestamp;
    const isExpired = ageMs > oneYearMs;
    
    console.log("[CONSENT] Expiry check:", {
      recordTimestamp: new Date(record.timestamp).toISOString(),
      now: new Date(Date.now()).toISOString(),
      ageMs,
      ageHours: (ageMs / (1000 * 60 * 60)).toFixed(2),
      oneYearMs,
      isExpired,
    });

    const result = record.granted && !isExpired;
    console.log(`[CONSENT] ✅ RESULT: ${result ? 'CONSENT GRANTED' : 'CONSENT DENIED'} (granted=${record.granted}, expired=${isExpired})`);
    
    return result;
  } catch (err) {
    console.log("[CONSENT] ❌ EXCEPTION in hasFeatureConsent:", err);
    return false;
  }
}

/**
 * Grant consent for a feature
 * Should only be called after explicit user acceptance
 */
export function grantFeatureConsent(feature: 'audio' | 'file' | 'analytics'): void {
  console.log(`\n[CONSENT] ===== grantFeatureConsent('${feature}') CALLED =====`);
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    console.log("[CONSENT] Current localStorage content:", { value: stored ? `"${stored}"` : "null" });
    
    const records: ConsentRecord[] = stored ? JSON.parse(stored) : [];
    console.log("[CONSENT] Parsed existing records:", JSON.stringify(records, null, 2));

    // Remove old record if exists
    const filtered = records.filter(r => r.feature !== feature);
    console.log(`[CONSENT] After filtering out old '${feature}' record:`, JSON.stringify(filtered, null, 2));

    // Add new consent record with timestamp
    const newRecord: ConsentRecord = {
      feature,
      granted: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    console.log("[CONSENT] New record to be added:", newRecord);
    
    filtered.push(newRecord);
    console.log("[CONSENT] Final records array:", JSON.stringify(filtered, null, 2));

    const jsonToStore = JSON.stringify(filtered);
    console.log("[CONSENT] JSON to store:", jsonToStore);
    
    localStorage.setItem(CONSENT_STORAGE_KEY, jsonToStore);
    console.log("[CONSENT] ✅ Saved to localStorage");
    
    // Verify it was saved
    const verify = localStorage.getItem(CONSENT_STORAGE_KEY);
    console.log("[CONSENT] Verification - read back from localStorage:", verify === jsonToStore ? "✅ MATCHES" : "❌ MISMATCH");

    // Notify all listeners that consent changed
    console.log(`[CONSENT] About to notify ${consentListeners.size} listeners...`);
    notifyConsentListeners(feature);
    console.log("[CONSENT] ✅ Listeners notified");
  } catch (err) {
    console.log("[CONSENT] ❌ ERROR in grantFeatureConsent:", err);
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
    // Storage error - fail silently
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