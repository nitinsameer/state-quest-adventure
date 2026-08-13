import { useSyncExternalStore } from "react";

// Sound + haptics FX using Web Audio API and navigator.vibrate.
// Zero dependencies. Safe on SSR (guards window).

/* ---------- sound preference (persisted) ---------- */

const SOUND_KEY = "india-explorer:sound:v1";
let soundOn = true;
let soundHydrated = false;
const soundListeners = new Set<() => void>();

function hydrateSound() {
  if (soundHydrated || typeof window === "undefined") return;
  soundHydrated = true;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw !== null) soundOn = raw === "1";
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
  osc.connect(g).connect(a.destination);
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
  src.connect(g).connect(a.destination);
  src.start(t0);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined") return;
  if (!isSoundOn()) return;
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
