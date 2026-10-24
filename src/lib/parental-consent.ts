/**
 * Simplified Audio Preference System
 *
 * Audio and basic features work WITHOUT requiring parental consent gates.
 * Users can simply toggle audio on/off in settings.
 * No blocking prompts or consent requirements.
 *
 * Analytics remains DISABLED for this kids app.
 */

import { STORAGE_KEYS } from "@/constants/storageKeys";

const AUDIO_PREF_KEY = STORAGE_KEYS.sound;

/**
 * Check if audio is enabled
 * Audio is enabled by default for seamless experience
 */
export function hasAudioEnabled(): boolean {
  try {
    const stored = localStorage.getItem(AUDIO_PREF_KEY);
    // Default to true if not explicitly disabled
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true; // Fail open - audio enabled if storage unavailable
  }
}

/**
 * Enable audio
 */
export function enableAudio(): void {
  try {
    localStorage.setItem(AUDIO_PREF_KEY, "true");
  } catch {
    // Storage error - ignore
  }
}

/**
 * Disable audio
 */
export function disableAudio(): void {
  try {
    localStorage.setItem(AUDIO_PREF_KEY, "false");
  } catch {
    // Storage error - ignore
  }
}

/**
 * Subscribe to audio preference changes
 * Returns unsubscribe function
 */
export function subscribeAudioChanges(listener: (enabled: boolean) => void): () => void {
  const handleChange = () => {
    listener(hasAudioEnabled());
  };

  window.addEventListener("storage", handleChange);
  return () => window.removeEventListener("storage", handleChange);
}

/**
 * Legacy functions for compatibility - these are no-ops now
 * Audio works without consent gates
 */
export function hasFeatureConsent(feature: "audio" | "file" | "analytics"): boolean {
  if (feature === "audio") {
    return hasAudioEnabled();
  }
  // Analytics and file features don't require consent anymore
  return false;
}

export function grantFeatureConsent(feature: "audio" | "file" | "analytics"): void {
  if (feature === "audio") {
    enableAudio();
  }
  // No-op for other features
}

export function revokeFeatureConsent(feature: "audio" | "file" | "analytics"): void {
  if (feature === "audio") {
    disableAudio();
  }
  // No-op for other features
}

export function subscribeConsentChanges(
  feature: "audio" | "file" | "analytics",
  listener: () => void,
): () => void {
  if (feature === "audio") {
    return subscribeAudioChanges(() => listener());
  }
  // No-op subscription for other features
  return () => {};
}

export function getAllConsentRecords() {
  return [];
}

export function clearAllConsents(): void {
  try {
    localStorage.removeItem(AUDIO_PREF_KEY);
  } catch {
    // Storage error
  }
}

export function ensureAudioConsentGranted(): void {
  // No-op - audio works by default without gates
}
