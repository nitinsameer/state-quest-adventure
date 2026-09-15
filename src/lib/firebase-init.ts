/**
 * Firebase initialization and configuration
 * Initializes Firebase app, Analytics, and Crashlytics
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

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

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.projectId && firebaseConfig.apiKey

// Initialize Firebase only if configured
let app: ReturnType<typeof initializeApp> | null = null
let analytics: ReturnType<typeof getAnalytics> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    analytics = getAnalytics(app)
    db = getFirestore(app)
    
    // Enable analytics collection (can be disabled for privacy)
    if (analytics) {
      setAnalyticsCollectionEnabled(analytics, true)
    }
    
    console.log('✅ Firebase initialized successfully')
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
  }
} else {
  console.warn('⚠️ Firebase not configured - analytics disabled. Set environment variables to enable.')
}

export { app, analytics, db, isFirebaseConfigured }
