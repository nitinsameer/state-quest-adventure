/**
 * Firebase initialization and configuration
 * Initializes Firebase app, Analytics, and Crashlytics
 * 
 * FIX #6 & #22: Console logging removed - only debug mode
 * FIX #13: Fail fast if required config is missing
 * FIX #27: Analytics disabled by default (COPPA compliance) - enable only after consent
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { debugLog, debugError } from './debug'

// Firebase configuration - loaded from environment variables
// Make sure these are set in .env.local or Vercel environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

// FIX #13: Check if Firebase is properly configured
const isFirebaseConfigured = !!(
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain
)

// FIX #13: Warn if Firebase is missing critical config
if (!isFirebaseConfigured && import.meta.env.PROD) {
  debugError('firebase', 'Firebase not configured - analytics disabled. Set environment variables to enable.')
}

// Initialize Firebase only if configured - but lazy, on-demand
let app: ReturnType<typeof initializeApp> | null = null
let analytics: ReturnType<typeof getAnalytics> | null = null
let db: ReturnType<typeof getFirestore> | null = null
let initialized = false
let analyticsEnabled = false

function initializeFirebase() {
  if (initialized) return
  initialized = true
  
  if (!isFirebaseConfigured) {
    return
  }

  try {
    app = initializeApp(firebaseConfig)
    analytics = getAnalytics(app)
    db = getFirestore(app)
    
    // FIX #27: Disable analytics by default (COPPA compliance)
    // Only enable after parent grants explicit consent
    if (analytics) {
      setAnalyticsCollectionEnabled(analytics, false)
    }
    
    debugLog('firebase', 'Firebase initialized successfully (analytics disabled by default)')
  } catch (error) {
    debugError('firebase', 'Firebase initialization failed', error)
  }
}

/**
 * Enable Firebase analytics after parental consent is granted
 * FIX #27: COPPA compliance - only enable after explicit parent consent
 */
export function enableAnalyticsAfterConsent(): void {
  if (!analytics) {
    // Try to initialize if not already done
    if (!initialized) {
      initializeFirebase()
    }
  }
  
  if (analytics && !analyticsEnabled) {
    setAnalyticsCollectionEnabled(analytics, true)
    analyticsEnabled = true
    debugLog('firebase', 'Analytics enabled after parental consent')
  }
}

/**
 * Disable Firebase analytics if consent is revoked
 * FIX #27: COPPA compliance - support consent revocation
 */
export function disableAnalyticsAfterConsentRevoked(): void {
  if (analytics && analyticsEnabled) {
    setAnalyticsCollectionEnabled(analytics, false)
    analyticsEnabled = false
    debugLog('firebase', 'Analytics disabled after consent revocation')
  }
}

export { app, analytics, db, isFirebaseConfigured, initializeFirebase }
