/**
 * Firebase initialization and configuration
 * 
 * PRIVACY FIRST: Analytics is DISABLED by default for this kids app.
 * We do not collect personal data, device identifiers, or usage analytics
 * without explicit, informed consent that meets child-safety requirements.
 * 
 * Currently, Firebase is initialized minimally with analytics disabled.
 * Firestore is available for essential app data only if needed.
 */

import { initializeApp } from "firebase/app";
import { getAnalytics, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { debugLog, debugError } from "./debug";

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Check if Firebase is properly configured
const isFirebaseConfigured = !!(
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain
);

if (!isFirebaseConfigured && import.meta.env.PROD) {
  debugError(
    "firebase",
    "Firebase not configured - essential features disabled. Set environment variables to enable.",
  );
}

// Initialize Firebase only if configured - lazy, on-demand
let app: ReturnType<typeof initializeApp> | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let initialized = false;

function initializeFirebase() {
  if (initialized) return;
  initialized = true;

  if (!isFirebaseConfigured) {
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);

    // PRIVACY: Analytics is PERMANENTLY DISABLED for this kids app
    // We do not enable analytics collection for children's apps
    // This complies with COPPA and child privacy best practices
    if (analytics) {
      setAnalyticsCollectionEnabled(analytics, false);
      debugLog("firebase", "Firebase initialized - Analytics collection DISABLED (kids app privacy)");
    }
  } catch (error) {
    debugError("firebase", "Firebase initialization failed", error);
  }
}

export { app, analytics, db, isFirebaseConfigured, initializeFirebase };
