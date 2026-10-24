/**
 * Audio Diagnostics Utility
 * Captures complete audio system state for debugging
 *
 * STEP 4 & 5: Verify all runtime settings and Web Speech API availability
 */

import { hasAudioEnabled } from "./parental-consent";
import { isSoundOn } from "./fx";
import { Capacitor } from "@capacitor/core";

export interface AudioDiagnostics {
  timestamp: number;
  platform: string;
  isNativePlatform: boolean;

  // Consent & Permissions
  audioNarrationConsent: boolean;

  // Sound settings
  soundToggleOn: boolean;

  // Web Speech API
  speechSynthesisAvailable: boolean;
  speechSynthesisState: string;
  voicesAvailable: number;

  // AudioContext
  audioContextAvailable: boolean;
  audioContextType: string;

  // Capacitor Info
  capacitorPlatform: string;

  // Environment
  userAgent: string;
  windowDefined: boolean;
}

/**
 * Capture complete audio diagnostics
 */
export function captureAudioDiagnostics(): AudioDiagnostics {
  const diagnostics: AudioDiagnostics = {
    timestamp: Date.now(),
    platform:
      typeof window !== "undefined"
        ? (window as any).navigator?.userAgentData?.platform || "unknown"
        : "ssr",
    isNativePlatform: Capacitor.isNativePlatform(),

    // Consent & Permissions
    audioNarrationConsent: hasAudioEnabled(),

    // Sound settings
    soundToggleOn: isSoundOn(),

    // Web Speech API
    speechSynthesisAvailable: typeof window !== "undefined" && !!window.speechSynthesis,
    speechSynthesisState:
      typeof window !== "undefined" && window.speechSynthesis
        ? window.speechSynthesis.speaking
          ? "speaking"
          : "idle"
        : "unavailable",
    voicesAvailable:
      typeof window !== "undefined" && window.speechSynthesis
        ? window.speechSynthesis.getVoices().length
        : 0,

    // AudioContext
    audioContextAvailable:
      typeof AudioContext !== "undefined" ||
      typeof (window as any).webkitAudioContext !== "undefined",
    audioContextType:
      typeof AudioContext !== "undefined"
        ? "AudioContext"
        : typeof (window as any).webkitAudioContext !== "undefined"
          ? "webkitAudioContext"
          : "unavailable",

    // Capacitor Info
    capacitorPlatform: Capacitor.getPlatform(),

    // Environment
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
    windowDefined: typeof window !== "undefined",
  };

  return diagnostics;
}

/**
 * Log complete audio diagnostics with [AUDIO DEBUG] prefix
 * Only logs in development builds
 */
export function logAudioDiagnostics(label?: string): void {
  if (import.meta.env.DEV) {
    const diag = captureAudioDiagnostics();

    console.log("[AUDIO DEBUG]", "=== AUDIO SYSTEM DIAGNOSTICS ===", label || "");
    console.log("[AUDIO DEBUG] Timestamp:", new Date(diag.timestamp).toISOString());
    console.log("[AUDIO DEBUG]", "PLATFORM");
    console.log("[AUDIO DEBUG]   Platform:", diag.platform);
    console.log("[AUDIO DEBUG]   Is Native:", diag.isNativePlatform);
    console.log("[AUDIO DEBUG]   Capacitor Platform:", diag.capacitorPlatform);
    console.log("[AUDIO DEBUG]   User Agent:", diag.userAgent.substring(0, 80));

    console.log("[AUDIO DEBUG]", "PERMISSIONS & SETTINGS");
    console.log(
      "[AUDIO DEBUG]   Audio Narration Consent:",
      diag.audioNarrationConsent ? "✓ YES" : "✗ NO",
    );
    console.log("[AUDIO DEBUG]   Sound Toggle:", diag.soundToggleOn ? "ON" : "OFF");

    console.log("[AUDIO DEBUG]", "WEB SPEECH API");
    console.log("[AUDIO DEBUG]   Available:", diag.speechSynthesisAvailable ? "✓ YES" : "✗ NO");
    console.log("[AUDIO DEBUG]   State:", diag.speechSynthesisState);
    console.log("[AUDIO DEBUG]   Voices:", diag.voicesAvailable);

    console.log("[AUDIO DEBUG]", "AUDIO CONTEXT");
    console.log("[AUDIO DEBUG]   Available:", diag.audioContextAvailable ? "✓ YES" : "✗ NO");
    console.log("[AUDIO DEBUG]   Type:", diag.audioContextType);

    console.log("[AUDIO DEBUG]", "=== END DIAGNOSTICS ===");
  }
}

/**
 * Get Web Speech API voices with diagnostic info
 */
export function getWebSpeechVoices(): { voices: SpeechSynthesisVoice[]; diagnostics: string } {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    const msg = "speechSynthesis not available";
    return { voices: [], diagnostics: msg };
  }

  const voices = window.speechSynthesis.getVoices();

  // Get available languages
  const languages = new Set(voices.map((v) => v.lang));

  return {
    voices,
    diagnostics: `${voices.length} voices available for languages: ${Array.from(languages).join(", ")}`,
  };
}

/**
 * Test Web Speech API with a simple utterance
 * Returns diagnostics about what happens when speaking
 */
export function testWebSpeechAPI(
  text: string = "Hello explorer",
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      const msg = "speechSynthesis not available";
      resolve({ success: false, message: msg });
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ speechSynthesis.onstart fired");
      };

      utterance.onend = () => {
        if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ speechSynthesis.onend fired");
        resolve({ success: true, message: "Speech completed successfully" });
      };

      utterance.onerror = (event) => {
        if (import.meta.env.DEV)
          console.log("[AUDIO DEBUG] ✗ speechSynthesis.onerror:", event.error);
        resolve({ success: false, message: `Speech error: ${event.error}` });
      };

      utterance.onpause = () => {
        if (import.meta.env.DEV) console.log("[AUDIO DEBUG] speechSynthesis.onpause fired");
      };

      utterance.onresume = () => {
        if (import.meta.env.DEV) console.log("[AUDIO DEBUG] speechSynthesis.onresume fired");
      };

      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] Calling speechSynthesis.speak()...");
      window.speechSynthesis.speak(utterance);
      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] speechSynthesis.speak() returned");

      // Set timeout in case onend never fires
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          if (import.meta.env.DEV)
            console.log("[AUDIO DEBUG] ⚠ Timeout: speechSynthesis still speaking after 10s");
          resolve({ success: false, message: "Speech timeout - still speaking after 10s" });
        }
      }, 10000);
    } catch (error) {
      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ Exception in testWebSpeechAPI:", error);
      resolve({
        success: false,
        message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  });
}
