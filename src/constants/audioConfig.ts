/**
 * Audio Configuration Constants
 * Centralized audio settings and defaults
 */

/**
 * Volume levels for different audio channels
 */
export const VOLUME_LEVELS = {
  master: 1.0,
  effects: 0.7,
  ambient: 0.3,
  ui: 0.8,
} as const;

/**
 * Default master volume (0-1 scale)
 */
export const DEFAULT_VOLUME = 1.0;

/**
 * LocalStorage key for audio settings
 */
export const AUDIO_STORAGE_KEY = "audio-settings:volume";

/**
 * Audio context state check interval (ms)
 */
export const AUDIO_CONTEXT_CHECK_INTERVAL = 1000;

/**
 * Maximum number of simultaneous oscillators
 */
export const MAX_OSCILLATORS = 32;

/**
 * Fade durations for audio transitions
 */
export const AUDIO_TRANSITIONS = {
  fast: 0.1, // 100ms
  normal: 0.2, // 200ms
  slow: 0.5, // 500ms
} as const;
