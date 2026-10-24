/**
 * Sound Generator with ADSR Envelope
 * Creates tones with Attack-Decay-Sustain-Release envelopes
 * Supports sequence playback and various waveforms
 */

import { getAudioContext, resumeAudioContext } from "./audioContext";

/**
 * Configuration for a tone
 */
export interface ToneConfig {
  /** Frequency in Hz */
  frequency: number;
  /** Duration in seconds */
  duration: number;
  /** Waveform type */
  waveform?: OscillatorType;
  /** Master volume (0-1) */
  volume?: number;
  /** Attack time in seconds (fade in) */
  attack?: number;
  /** Decay time in seconds (fade to sustain level) */
  decay?: number;
  /** Sustain level (0-1) */
  sustain?: number;
  /** Release time in seconds (fade out) */
  release?: number;
}

/**
 * Play a single tone with ADSR envelope
 * @param config Tone configuration
 */
export async function playTone(config: ToneConfig): Promise<void> {
  const {
    frequency,
    duration,
    waveform = "sine",
    volume = 0.5,
    attack = 0.01,
    decay = 0.1,
    sustain = 0.7,
    release = 0.1,
  } = config;

  // Ensure AudioContext is running
  await resumeAudioContext();

  const ctx = getAudioContext();
  if (!ctx) {
    console.warn("[SoundGenerator] AudioContext not available");
    return;
  }

  try {
    const now = ctx.currentTime;
    const sustainDuration = Math.max(0, duration - attack - decay - release);

    // Create oscillator
    const osc = ctx.createOscillator();
    osc.type = waveform;
    osc.frequency.setValueAtTime(frequency, now);

    // Create gain for ADSR envelope
    const gain = ctx.createGain();

    // ADSR Envelope
    gain.gain.setValueAtTime(0, now); // Start at silence

    // Attack: fade from 0 to volume
    gain.gain.linearRampToValueAtTime(volume, now + attack);

    // Decay: fade from volume to sustain level
    const sustainLevel = volume * sustain;
    gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);

    // Sustain: hold at sustain level
    if (sustainDuration > 0) {
      gain.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainDuration);
    }

    // Release: fade from sustain to silence
    gain.gain.linearRampToValueAtTime(0, now + attack + decay + sustainDuration + release);

    // Connect and play
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + attack + decay + sustainDuration + release);
  } catch (error) {
    console.error("[SoundGenerator] Failed to play tone:", error);
  }
}

/**
 * Play a sequence of tones
 * @param tones Array of tone configurations
 * @param gap Gap between tones in seconds (default 0.05)
 */
export async function playSequence(tones: ToneConfig[], gap: number = 0.05): Promise<void> {
  if (tones.length === 0) return;

  // Ensure AudioContext is running
  await resumeAudioContext();

  const ctx = getAudioContext();
  if (!ctx) {
    console.warn("[SoundGenerator] AudioContext not available");
    return;
  }

  try {
    let delay = 0;

    for (const tone of tones) {
      // Calculate total duration including envelope
      const { attack = 0.01, decay = 0.1, release = 0.1 } = tone;
      const totalDuration = tone.duration + attack + decay + release;

      // Play tone with delay
      const now = ctx.currentTime + delay;
      const waveform = tone.waveform ?? "sine";
      const volume = tone.volume ?? 0.5;
      const sustainLevel = volume * (tone.sustain ?? 0.7);

      // Create oscillator
      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(tone.frequency, now);

      // Create gain for ADSR
      const gain = ctx.createGain();

      // ADSR Envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + attack);
      gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);

      const sustainDuration = Math.max(0, tone.duration - attack - decay - release);
      if (sustainDuration > 0) {
        gain.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainDuration);
      }

      gain.gain.linearRampToValueAtTime(0, now + attack + decay + sustainDuration + release);

      // Connect and play
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + totalDuration);

      // Add gap between tones
      delay += totalDuration + gap;
    }
  } catch (error) {
    console.error("[SoundGenerator] Failed to play sequence:", error);
  }
}
