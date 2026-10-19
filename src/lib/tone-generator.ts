/**
 * Success Toast Tone Generator
 * Generates a native synthesized three-note ascending chime using Web Audio API
 * No external audio files needed - lightweight and responsive
 */

let audioContextInstance: AudioContext | null = null;

/**
 * Get or create the shared AudioContext
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!audioContextInstance) {
      // Use webkit prefix for older browsers
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextInstance = new AudioContextClass();
      }
    }

    // Resume suspended context (required on some browsers)
    if (audioContextInstance?.state === "suspended") {
      audioContextInstance.resume().catch(() => {
        // Resume failed silently - audio is non-critical
      });
    }

    return audioContextInstance;
  } catch (error) {
    // AudioContext not available
    return null;
  }
}

/**
 * Play a three-note ascending success chime
 * Notes: C5 (523.25 Hz) → E5 (659.25 Hz) → G5 (783.99 Hz)
 * Duration: ~450ms total with staggered notes
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return; // AudioContext not available, fail silently

    // Three-note ascending chime frequencies (Hz)
    const notes = [
      { freq: 523.25, startTime: 0 },    // C5
      { freq: 659.25, startTime: 0.22 }, // E5
      { freq: 783.99, startTime: 0.44 }, // G5
    ];

    // Play each note
    notes.forEach(({ freq, startTime }) => {
      playNote(ctx, freq, 0.2, startTime);
    });
  } catch (error) {
    // Fail silently - audio is never critical
  }
}

/**
 * Helper: Play a single oscillator note
 */
function playNote(ctx: AudioContext, frequency: number, duration: number, startTime: number): void {
  try {
    const start = ctx.currentTime + startTime;
    const end = start + duration;

    // Create oscillator
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, start);

    // Create gain (envelope)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.01); // Attack: 10ms to 0.3
    gain.gain.linearRampToValueAtTime(0, end - 0.05); // Release: 50ms fade out
    gain.gain.setValueAtTime(0, end); // Stop

    // Connect and play
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(end);
  } catch (error) {
    // Fail silently
  }
}
