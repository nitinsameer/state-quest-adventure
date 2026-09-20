/**
 * Celebration sound effects
 * Uses Web Audio API for low-latency, COPPA-safe audio
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play achievement unlock chime (800ms celebratory tone)
 * Two ascending notes: E4 (330Hz) → G4 (392Hz)
 */
export function playAchievementSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // First note: E4 (330 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.value = 330;
    osc1.type = "sine";
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second note: G4 (392 Hz) - delayed by 150ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.value = 392;
    osc2.type = "sine";
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);

    console.log("[Celebration Sounds] Achievement unlock chime played");
  } catch (error) {
    console.warn("[Celebration Sounds] Failed to play achievement sound:", error);
  }
}

/**
 * Play success "ding" sound (200ms quick tone)
 * Single note: A4 (440 Hz)
 */
export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 440;
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);

    console.log("[Celebration Sounds] Success ding played");
  } catch (error) {
    console.warn("[Celebration Sounds] Failed to play success sound:", error);
  }
}

/**
 * Play error tone (200ms warning beep)
 * Single note: C4 (262 Hz) - lower frequency signals error
 */
export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 262;
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);

    console.log("[Celebration Sounds] Error tone played");
  } catch (error) {
    console.warn("[Celebration Sounds] Failed to play error sound:", error);
  }
}

/**
 * Check if sounds are enabled (respects user's sound toggle)
 */
export function areSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const soundState = localStorage.getItem("india-explorer:sound:v1");
    return soundState === "1";
  } catch {
    return false;
  }
}
