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

/**
 * Request consent for a feature (audio or file access)
 * Returns true if already granted, false if needs to be requested
 */
export function hasFeatureConsent(feature: 'audio' | 'file'): boolean {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return false

    const records: ConsentRecord[] = JSON.parse(stored)
    const record = records.find(r => r.feature === feature)

    if (!record) return false

    // Validate consent is recent (within 1 year)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    const isExpired = Date.now() - record.timestamp > oneYearMs

    return record.granted && !isExpired
  } catch {
    return false
  }
}

/**
 * Grant consent for a feature
 * Should only be called after explicit user acceptance
 */
export function grantFeatureConsent(feature: 'audio' | 'file'): void {
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
  } catch {
    // Storage error - fail silently but user won't have consent
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
  } catch {
    // Storage error - fail silently
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
