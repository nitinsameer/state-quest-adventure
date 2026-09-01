/**
 * Audio mixer for proper audio channel management
 * Prevents glitchy sounds from oscillator conflicts
 * Provides separate control for ambient, effects, and master levels
 */

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientGain: GainNode | null = null;
let effectsGain: GainNode | null = null;
let isInitialized = false;

/**
 * Initialize audio mixer
 * Call once when AudioContext is created
 * @param ctx AudioContext instance
 */
export function initAudioMixer(ctx: AudioContext): void {
  if (isInitialized) return;
  isInitialized = true;

  audioContext = ctx;

  // Create separate gain nodes for each audio channel
  masterGain = ctx.createGain();
  ambientGain = ctx.createGain();
  effectsGain = ctx.createGain();

  // Set gain levels (prevent clipping and balance volume)
  masterGain.gain.setValueAtTime(0.6, ctx.currentTime); // Master at 60%
  ambientGain.gain.setValueAtTime(0.08, ctx.currentTime); // Ambient quiet background (8%)
  effectsGain.gain.setValueAtTime(0.25, ctx.currentTime); // Effects normal level (25%)

  // Connect channels: ambient & effects → master → destination
  ambientGain.connect(masterGain);
  effectsGain.connect(masterGain);
  masterGain.connect(ctx.destination);

  console.log("[AudioMixer] Initialized with proper gain management");
}

/**
 * Get the ambient audio gain node (for background music)
 * @returns GainNode for ambient channel or null
 */
export function getAmbientGain(): GainNode | null {
  return ambientGain;
}

/**
 * Get the effects audio gain node (for sound FX)
 * @returns GainNode for effects channel or null
 */
export function getEffectsGain(): GainNode | null {
  return effectsGain;
}

/**
 * Get the master gain node
 * @returns GainNode for master output or null
 */
export function getMasterGain(): GainNode | null {
  return masterGain;
}

/**
 * Set master volume (0.0 to 1.0)
 * @param volume Volume level between 0 and 1
 */
export function setMasterVolume(volume: number): void {
  if (masterGain && audioContext) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    masterGain.gain.setValueAtTime(clampedVolume, audioContext.currentTime);
  }
}

/**
 * Set ambient volume (0.0 to 1.0)
 * @param volume Volume level between 0 and 1
 */
export function setAmbientVolume(volume: number): void {
  if (ambientGain && audioContext) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    ambientGain.gain.setValueAtTime(clampedVolume, audioContext.currentTime);
  }
}

/**
 * Set effects volume (0.0 to 1.0)
 * @param volume Volume level between 0 and 1
 */
export function setEffectsVolume(volume: number): void {
  if (effectsGain && audioContext) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    effectsGain.gain.setValueAtTime(clampedVolume, audioContext.currentTime);
  }
}

/**
 * Mute all audio
 */
export function muteAll(): void {
  if (masterGain && audioContext) {
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
  }
}

/**
 * Unmute all audio
 */
export function unmuteAll(): void {
  if (masterGain && audioContext) {
    masterGain.gain.setValueAtTime(0.6, audioContext.currentTime);
  }
}

/**
 * Check if mixer is initialized
 */
export function isMixerInitialized(): boolean {
  return isInitialized;
}
