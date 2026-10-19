import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { initAudioMixer, getEffectsGain, getAmbientGain } from "./audio-mixer";
import { debugLog, debugError } from "./debug";
import { hasFeatureConsent } from "./parental-consent";
import { validateSoundToggle } from "./localStorage-schema";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// Sound + haptics FX using Web Audio API, navigator.vibrate, and Capacitor Haptics.
// On native (Android/iOS), uses Capacitor.Haptics for richer haptic feedback.
// On web, falls back to navigator.vibrate. Safe on SSR (guards window).

/* ---------- sound preference (persisted) ---------- */

const SOUND_KEY = STORAGE_KEYS.sound;
let soundOn = false; // Sound toggle (separate from audio narration permission)
let soundHydrated = false;
const soundListeners = new Set<() => void>();

/**
 * Ensure audio context is initialized for audio operations (TTS, effects, etc.)
 * This initializes the Web Audio API and audio mixer regardless of sound toggle state
 * Safe to call multiple times - only initializes once
 * Returns the AudioContext or null if initialization failed
 */
export function ensureAudioContext(): AudioContext | null {
  if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ensureAudioContext() called");

  const ctx = ac();

  if (ctx) {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ AudioContext available", {
      state: ctx.state,
      sampleRate: ctx.sampleRate,
      baseLatency: (ctx as any).baseLatency,
      outputLatency: (ctx as any).outputLatency,
    });
    debugLog("fx", "AudioContext is ready for audio operations", {
      state: ctx.state,
      sampleRate: ctx.sampleRate,
    });
  } else {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ AudioContext is NULL");
    debugError("fx", "Failed to ensure AudioContext - audio operations may fail");
  }
  return ctx;
}

function hydrateSound() {
  if (soundHydrated || typeof window === "undefined") return;
  soundHydrated = true;
  try {
    // Sound toggle (separate from audio narration which is controlled by parental consent)
    // CRITICAL FIX #1.5: Validate sound toggle with Zod schema
    const raw = localStorage.getItem(SOUND_KEY);
    const validated = validateSoundToggle(raw);
    soundOn = validated === "1";

    // If raw was null or invalid, ensure we persist the valid default
    if (raw !== validated) {
      localStorage.setItem(SOUND_KEY, validated);
    }

    debugLog("fx", "Sound toggle hydrated from storage", {
      key: SOUND_KEY,
      storedValue: raw,
      validated: validated,
      hydrated: soundOn,
    });
  } catch (err) {
    /* storage unavailable */
    soundOn = true; // Default to ON
    debugError("fx", "Failed to hydrate Sound toggle from localStorage, using default", err);
  }
  for (const l of soundListeners) l();
}

function subscribeSound(listener: () => void) {
  hydrateSound();
  soundListeners.add(listener);
  return () => soundListeners.delete(listener);
}

// Ambient audio auto-restart removed - background music disabled globally

export function isSoundOn() {
  hydrateSound();
  return soundOn;
}

export function setSoundOn(next: boolean) {
  soundOn = next;
  soundHydrated = true;
  try {
    localStorage.setItem(SOUND_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }

  // If disabling audio, immediately stop all active sound effects
  if (!next) {
    stopAllActiveSounds();
  }

  for (const l of soundListeners) l();
}

export function toggleSound() {
  setSoundOn(!isSoundOn());
}

/** React hook: current sound on/off preference. */
export function useSoundOn(): boolean {
  return useSyncExternalStore(
    subscribeSound,
    () => soundOn,
    () => true,
  );
}

let ctx: AudioContext | null = null;

// Track active sound nodes for immediate cutoff when audio is disabled
const activeSoundNodes = new Set<{ osc?: OscillatorNode; gain: GainNode }>();

/**
 * Clean up the global AudioContext and all associated nodes
 * Called on app unload/destroy to prevent memory leaks
 * This must be called before the app is destroyed
 */
export function cleanupAudioContext() {
  // Stop all active sounds
  stopAllActiveSounds();

  // Close the AudioContext
  if (ctx) {
    try {
      // Ensure we're not suspended before closing
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {
          // Ignore if can't resume
        });
      }

      // Close the context to free all resources
      void ctx.close();
      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ AudioContext closed successfully");
      debugLog("fx", "AudioContext closed and resources freed");
    } catch (error) {
      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ Error closing AudioContext:", error);
      debugError("fx", "Error closing AudioContext", error);
    } finally {
      ctx = null;
    }
  }
}

/**
 * Initialize audio cleanup handlers for the application
 * Should be called once during app initialization (in Root component)
 * Sets up beforeunload listener to properly close AudioContext
 */
export function initializeAudioCleanup() {
  if (typeof window === "undefined") return;

  // Add cleanup on page unload
  const handleUnload = () => {
    cleanupAudioContext();
  };

  window.addEventListener("beforeunload", handleUnload);

  // Also cleanup when visibility changes (user leaves tab)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (import.meta.env.DEV) console.log("[AUDIO DEBUG] Page hidden - stopping audio");
      stopAllActiveSounds();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup on app destroy (for SPA navigation or manual destroy)
  // Expose a manual cleanup function if needed
  (window as any).__cleanupAudio = cleanupAudioContext;

  if (import.meta.env.DEV) console.log("[AUDIO DEBUG] Audio cleanup handlers initialized");
  debugLog("fx", "Audio cleanup handlers initialized on window unload");

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
/**
 * Stop all currently playing sound effects immediately
 * Called when user disables audio toggle or on cleanup
 */
function stopAllActiveSounds() {
  const a = ac();
  if (!a) return;

  for (const node of activeSoundNodes) {
    try {
      if (node.osc) {
        // Cancel scheduled frequency/gain changes and stop immediately
        node.osc.frequency.cancelScheduledValues(a.currentTime);
        node.osc.stop(a.currentTime);
      }
      // Fade out gain immediately to silence
      node.gain.gain.cancelScheduledValues(a.currentTime);
      node.gain.gain.setValueAtTime(0, a.currentTime);
    } catch {
      // Ignore errors if node already stopped
    }
  }
  activeSoundNodes.clear();
}

/**
 * Get or create the global AudioContext
 * This is decoupled from the Sound toggle - audio context initializes regardless
 * The Sound toggle only controls volume/output, not initialization
 * @returns AudioContext if successfully created, null otherwise
 */
function ac(): AudioContext | null {
  if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ac() called");

  if (typeof window === "undefined") {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ window is undefined (SSR)");
    return null;
  }

  if (ctx) {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ AudioContext already exists", { state: ctx.state });
    return ctx;
  }

  if (import.meta.env.DEV) console.log("[AUDIO DEBUG] AudioContext does not exist yet - creating...");

  const AC =
    (
      window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      }
    ).AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AC) {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ AudioContext constructor not available on window");
    return null;
  }

  if (import.meta.env.DEV) console.log("[AUDIO DEBUG] AudioContext constructor available - creating new instance");

  try {
    ctx = new AC();
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ AudioContext created successfully", {
      state: ctx.state,
      sampleRate: ctx.sampleRate,
    });

    // Initialize audio mixer on first AudioContext creation
    initAudioMixer(ctx);
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ Audio mixer initialized");

    debugLog("fx", "AudioContext created and mixer initialized", {
      state: ctx.state,
      sampleRate: ctx.sampleRate,
    });
  } catch (error) {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ Exception creating AudioContext", error);
    debugError("fx", "Failed to create AudioContext", error);
    return null;
  }

  // Resume context if suspended (required for user interaction on web)
  if (ctx && ctx.state === "suspended") {
    if (import.meta.env.DEV) console.log("[AUDIO DEBUG] AudioContext suspended - attempting resume...");
    void ctx
      .resume()
      .then(() => { if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✓ AudioContext resumed"); })
      .catch((err) => { if (import.meta.env.DEV) console.log("[AUDIO DEBUG] ✗ AudioContext resume failed", err); });
  }

  return ctx;
}

/**
 * Determine if sound output should be played through speakers
 * Checks BOTH conditions:
 * 1. Sound toggle enabled in profile (isSoundOn)
 * 2. Audio consent granted during profile creation (hasFeatureConsent)
 * @returns true only if BOTH are true
 */
function shouldPlaySound(): boolean {
  // Sound effects only need the sound toggle, not audio narration consent
  // Audio narration (TTS) has its own separate consent check
  return isSoundOn();
}

type ToneOpts = {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  delay?: number;
};

function tone({ freq, dur = 0.18, type = "sine", gain = 0.18, slideTo, delay = 0 }: ToneOpts) {
  // Get or create audio context (decoupled from Sound toggle)
  const a = ac();
  if (!a) {
    console.log("[FX/tone] ❌ No AudioContext available");
    return;
  }

  // Resume AudioContext if suspended (required for user gesture on native)
  if (a.state === "suspended") {
    console.log("[FX/tone] ⚠️ AudioContext suspended - attempting to resume");
    void a
      .resume()
      .then(() => console.log("[FX/tone] ✅ AudioContext resumed"))
      .catch((err) => console.log("[FX/tone] ❌ AudioContext resume failed:", err));
  }

  // Only output sound if Sound toggle is ON
  const shouldPlay = shouldPlaySound();
  if (!shouldPlay) {
    console.log("[FX/tone] ❌ shouldPlaySound=false, isSoundOn=", isSoundOn());
    return;
  }

  console.log("[FX/tone] ✅ Playing tone", { freq, dur, shouldPlay });

  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  // Track this sound for immediate cutoff when audio is disabled
  const soundNode = { osc, gain: g };
  activeSoundNodes.add(soundNode);

  // Always connect directly to destination for reliability
  // The mixer is optional - effects must work even without it
  osc.connect(g);
  g.connect(a.destination);

  osc.start(t0);
  osc.stop(t0 + dur + 0.02);

  // Remove from active set after sound finishes
  setTimeout(
    () => {
      activeSoundNodes.delete(soundNode);
    },
    (dur + delay + 0.02) * 1000,
  );
}

function noise(dur = 0.25, gain = 0.15, delay = 0) {
  // Get or create audio context (decoupled from Sound toggle)
  const a = ac();
  if (!a) return;

  // Only output sound if Sound toggle is ON
  if (!shouldPlaySound()) return;

  // Optimize: cap noise duration to 0.3s max for performance
  const maxNoiseDur = Math.min(dur, 0.3);

  const t0 = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * maxNoiseDur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + maxNoiseDur);

  // Track this sound for immediate cutoff when audio is disabled
  const soundNode = { gain: g };
  activeSoundNodes.add(soundNode);

  // Always connect directly to destination for reliability
  src.connect(g);
  g.connect(a.destination);

  src.start(t0);

  // Remove from active set after sound finishes
  setTimeout(
    () => {
      activeSoundNodes.delete(soundNode);
    },
    (maxNoiseDur + delay) * 1000,
  );
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (!isSoundOn()) return;

  // Use Capacitor Haptics on native platforms
  if (Capacitor.isNativePlatform()) {
    if (typeof pattern === "number") {
      // Single duration: light impact
      void Haptics.impact({ style: ImpactStyle.Light });
    } else {
      // Pattern: play heavy impact for longer patterns
      void Haptics.impact({ style: ImpactStyle.Heavy });
    }
    return;
  }

  // Fallback to navigator.vibrate on web
  const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
  if (typeof nav.vibrate === "function") {
    try {
      nav.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}

/** Correct quiz answer: rising two-note chime + short buzz. */
export function fxCorrect() {
  tone({ freq: 660, dur: 0.14, type: "triangle", gain: 0.22 });
  tone({ freq: 990, dur: 0.22, type: "triangle", gain: 0.22, delay: 0.12 });
  vibrate(30);
}

/** Wrong answer: soft descending buzz + double bump. */
export function fxWrong() {
  tone({ freq: 300, dur: 0.28, type: "sawtooth", gain: 0.15, slideTo: 140 });
  vibrate([40, 60, 40]);
}

/** Confetti / celebration: arpeggio + shimmer noise + celebratory buzz. */
export function fxConfetti() {
  const notes = [523, 659, 784, 1046]; // C E G C
  notes.forEach((f, i) =>
    tone({ freq: f, dur: 0.28, type: "triangle", gain: 0.2, delay: i * 0.08 }),
  );
  tone({ freq: 1568, dur: 0.5, type: "sine", gain: 0.12, delay: 0.28 });
  noise(0.6, 0.08, 0.05);
  vibrate([20, 40, 20, 40, 60]);
}

/** Passport stamp: thunk + tail. */
export function fxStamp() {
  tone({ freq: 120, dur: 0.09, type: "square", gain: 0.35 });
  noise(0.12, 0.22);
  tone({ freq: 70, dur: 0.22, type: "sine", gain: 0.25, delay: 0.02 });
  vibrate([80, 30, 40]);
}

/** Generic tap. */
export function fxTap() {
  tone({ freq: 520, dur: 0.06, type: "triangle", gain: 0.14 });
  vibrate(10);
}

/** Whoosh / swipe effect for screen transitions. */
export function fxWhoosh() {
  tone({ freq: 400, dur: 0.18, type: "sine", gain: 0.12, slideTo: 200 });
  noise(0.18, 0.08);
}

/* ---------- ambient background music ---------- */

// Ambient music disabled globally - implementation removed to reduce bundle size and improve startup performance
