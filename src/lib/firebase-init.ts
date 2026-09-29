/**
 * Firebase initialization and configuration
 * Initializes Firebase app, Analytics, and Crashlytics
 * 
 * FIX #6 & #22: Console logging removed - only debug mode
 * FIX #13: Fail fast if required config is missing
 * COPPA FIX #1.5: Analytics disabled by default, enabled only after consent granted
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { debugLog, debugError } from './debug'
import { hasFeatureConsent } from './parental-consent'

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
    
    // COPPA FIX #1.5: Analytics disabled by default for kids app
    // Only enable analytics AFTER explicit parental consent is granted
    // This prevents illegal data collection before consent
    if (analytics) {
      // Start with analytics collection DISABLED
      setAnalyticsCollectionEnabled(analytics, false)
      debugLog('firebase', 'Firebase initialized - Analytics collection DISABLED pending consent')
    }
  } catch (error) {
    debugError('firebase', 'Firebase initialization failed', error)
  }
}


/**
 * Enable analytics after consent is granted
 * Call this function only after user/parent has explicitly consented to analytics
 * COPPA REQUIREMENT: Must be called after hasFeatureConsent('analytics') returns true
 */
function enableAnalyticsAfterConsent() {
  if (analytics) {
    try {
      setAnalyticsCollectionEnabled(analytics, true)
      debugLog('firebase', 'Analytics collection ENABLED after consent granted')
    } catch (error) {
      debugError('firebase', 'Failed to enable analytics after consent', error)
    }
  }
}
export { app, analytics, db, isFirebaseConfigured, initializeFirebase, enableAnalyticsAfterConsent }
