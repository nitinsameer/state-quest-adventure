import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { initAudioMixer, getEffectsGain, getAmbientGain } from "./audio-mixer";

// Sound + haptics FX using Web Audio API, navigator.vibrate, and Capacitor Haptics.
// On native (Android/iOS), uses Capacitor.Haptics for richer haptic feedback.
// On web, falls back to navigator.vibrate. Safe on SSR (guards window).

/* ---------- sound preference (persisted) ---------- */

const SOUND_KEY = "india-explorer:sound:v1";
let soundOn = true;
let soundHydrated = false;
const soundListeners = new Set<() => void>();

function hydrateSound() {
  if (soundHydrated || typeof window === "undefined") return;
  soundHydrated = true;
  try {
    // FIX #24: Default to false (opt-in) not true
    // Only enable if explicitly set to "1"
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw !== null) soundOn = raw === "1";
    else soundOn = false; // Default: sound disabled until user enables
  } catch {
    /* storage unavailable */
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
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!isSoundOn()) return null;
  if (!ctx) {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // Initialize audio mixer on first AudioContext creation
    initAudioMixer(ctx);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
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
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  
  // Always connect directly to destination for reliability
  // The mixer is optional - effects must work even without it
  osc.connect(g);
  g.connect(a.destination);
  
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.25, gain = 0.15, delay = 0) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  
  // Always connect directly to destination for reliability
  src.connect(g);
  g.connect(a.destination);
  
  src.start(t0);
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
    try { nav.vibrate(pattern); } catch { /* noop */ }
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
  notes.forEach((f, i) => tone({ freq: f, dur: 0.28, type: "triangle", gain: 0.2, delay: i * 0.08 }));
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

let ambientAudioElement: HTMLAudioElement | null = null;
let ambientOscillator: OscillatorNode | null = null;
let localAmbientGain: GainNode | null = null;
let ambientRunning = false;
let musicFileExists = true;

function startAmbientMusic() {
  if (ambientRunning) {
    console.log("[Ambient] Already running, skipping");
    return;
  }
  ambientRunning = true;

  if (typeof window === "undefined") {
    console.log("[Ambient] Window not defined, aborting");
    return;
  }

  // Try to load music file first
  if (musicFileExists && !ambientAudioElement) {
    console.log("[Ambient] Creating audio element for file: ./ambient-music.mp3");
    ambientAudioElement = new Audio();
    
    // Use /assets/ path for Capacitor (Capacitor serves from localhost://)
    // or direct /ambient-music.mp3 for web
    ambientAudioElement.src = "./ambient-music.mp3";
    ambientAudioElement.loop = true;
    ambientAudioElement.volume = 0;
    ambientAudioElement.crossOrigin = "anonymous";

    console.log("[Ambient] Audio element created, src:", ambientAudioElement.src);

    ambientAudioElement.addEventListener(
      "error",
      (e) => {
        console.error(
          "[Ambient] Load error:",
          e.type,
          "Network state:",
          ambientAudioElement?.networkState,
          "Ready state:",
          ambientAudioElement?.readyState
        );
        musicFileExists = false;
        ambientAudioElement = null;
        console.log("[Ambient] Falling back to generated tone");
        startAmbientTone();
      },
      { once: true }
    );

    ambientAudioElement.addEventListener(
      "canplay",
      () => {
        console.log("[Ambient] Audio ready to play, currentTime:", ambientAudioElement?.currentTime);
        if (!ambientAudioElement || !ambientRunning) {
          console.log("[Ambient] Audio element or ambientRunning is null, aborting play");
          return;
        }
        
        // Fade in to 0.15 volume over 1.5s
        ambientAudioElement.volume = 0;
        ambientAudioElement.play().catch((err) => {
          console.error("[Ambient] Play error:", err.message);
          musicFileExists = false;
          ambientAudioElement = null;
          startAmbientTone();
        });

        const startTime = Date.now();
        const fadeInDuration = 1500;
        const fadeInterval = setInterval(() => {
          if (!ambientAudioElement || !ambientRunning) {
            clearInterval(fadeInterval);
            return;
          }
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fadeInDuration, 1);
          ambientAudioElement.volume = 0.15 * progress;
          if (progress >= 1) {
            clearInterval(fadeInterval);
            console.log("[Ambient] Music playing at full volume, duration:", ambientAudioElement.duration);
          }
        }, 50);
      },
      { once: true }
    );

    console.log("[Ambient] Calling load()");
    ambientAudioElement.load();

    // Fallback timeout: if canplay doesn't fire in 3s, fallback to tone
    setTimeout(() => {
      if (musicFileExists && ambientAudioElement && ambientAudioElement.readyState < 2) {
        console.warn("[Ambient] Timeout waiting for canplay, falling back to tone. ReadyState:", ambientAudioElement.readyState);
        musicFileExists = false;
        ambientAudioElement = null;
        startAmbientTone();
      }
    }, 3000);
  } else if (!musicFileExists) {
    console.log("[Ambient] Music file marked as not existing, starting tone");
    startAmbientTone();
  }
}

function startAmbientTone() {
  const a = ac();
  if (!a) return;

  // Fallback: Subtle ambient pad (low frequency drone with slow LFO modulation)
  // This creates a gentle, loopable ambient sound
  ambientOscillator = a.createOscillator();
  ambientOscillator.type = "sine";
  ambientOscillator.frequency.setValueAtTime(55, a.currentTime); // Low A note (very warm)

  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(80, a.currentTime); // Keep only low frequencies to reduce harshness

  localAmbientGain = a.createGain();
  localAmbientGain.gain.setValueAtTime(0.08, a.currentTime);

  // Slow LFO modulation (0.5 Hz swell) for organic warmth
  const lfo = a.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.5, a.currentTime);
  const lfoGain = a.createGain();
  lfoGain.gain.setValueAtTime(0.008, a.currentTime);

  lfo.connect(localAmbientGain.gain);

  // Connect signal chain
  ambientOscillator.connect(filter);
  filter.connect(localAmbientGain);

  // Route through mixer if available, else direct to destination
  const ambientMixGain = getAmbientGain();
  if (ambientMixGain) {
    localAmbientGain.connect(ambientMixGain);
  } else {
    localAmbientGain.connect(a.destination);
  }

  ambientOscillator.start();
  lfo.start();

  console.log("[Ambient] Started fallback generated ambient tone");
}

function stopAmbientMusic() {
  if (!ambientRunning) return;
  ambientRunning = false;

  // Stop audio element if playing
  if (ambientAudioElement) {
    const startTime = Date.now();
    const fadeOutDuration = 500;
    const fadeInterval = setInterval(() => {
      if (!ambientAudioElement) {
        clearInterval(fadeInterval);
        return;
      }
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / fadeOutDuration, 1);
      ambientAudioElement.volume = 0.15 * (1 - progress);
      if (progress >= 1) {
        clearInterval(fadeInterval);
        ambientAudioElement.pause();
        ambientAudioElement.currentTime = 0;
      }
    }, 50);
  }

  // Stop oscillator if playing
  if (ambientOscillator && localAmbientGain) {
    const a = ac();
    if (a) {
      localAmbientGain.gain.exponentialRampToValueAtTime(
        0.0001,
        a.currentTime + 0.5
      );
      setTimeout(() => {
        ambientOscillator?.stop();
        ambientOscillator = null;
        localAmbientGain = null;
      }, 550);
    }
  }
}
// startAmbient and stopAmbient removed - ambient music globally disabled