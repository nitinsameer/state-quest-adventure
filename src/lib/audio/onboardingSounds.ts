/**
 * Onboarding Sound Effects Library
 * Celebratory and engaging sounds for each onboarding interaction
 * All sounds are designed to feel responsive and encouraging
 */

import { playTone, playSequence, type ToneConfig } from "./soundGenerator";

/**
 * Avatar selection sound - uplifting single note
 * 800Hz sine wave, 80ms, vol 0.6
 */
export async function avatarSelect(): Promise<void> {
  await playTone({
    frequency: 800,
    duration: 0.08,
    waveform: "sine",
    volume: 0.6,
    attack: 0.01,
    decay: 0.02,
    sustain: 0.8,
    release: 0.03,
  });
}

/**
 * Age selection sound - warm triangle wave
 * 600Hz triangle, 120ms, vol 0.7
 */
export async function ageSelect(): Promise<void> {
  await playTone({
    frequency: 600,
    duration: 0.12,
    waveform: "triangle",
    volume: 0.7,
    attack: 0.01,
    decay: 0.03,
    sustain: 0.75,
    release: 0.04,
  });
}

/**
 * Checkbox confirmation sound - quick and positive
 * 900Hz sine, 150ms, vol 0.7
 */
export async function checkboxConfirm(): Promise<void> {
  await playTone({
    frequency: 900,
    duration: 0.15,
    waveform: "sine",
    volume: 0.7,
    attack: 0.01,
    decay: 0.02,
    sustain: 0.8,
    release: 0.05,
  });
}

/**
 * Next button click - two-tone ascending
 * 600Hz → 800Hz, 200ms total, vol 0.6
 */
export async function nextButton(): Promise<void> {
  await playSequence(
    [
      {
        frequency: 600,
        duration: 0.1,
        waveform: "sine",
        volume: 0.6,
        attack: 0.01,
        decay: 0.02,
        sustain: 0.7,
        release: 0.02,
      },
      {
        frequency: 800,
        duration: 0.1,
        waveform: "sine",
        volume: 0.6,
        attack: 0.01,
        decay: 0.02,
        sustain: 0.7,
        release: 0.02,
      },
    ],
    0.02,
  );
}

/**
 * Success chime - celebratory two-tone ascending
 * 800Hz → 1200Hz, 400ms total, vol 0.8
 */
export async function successChime(): Promise<void> {
  await playSequence(
    [
      {
        frequency: 800,
        duration: 0.2,
        waveform: "sine",
        volume: 0.8,
        attack: 0.01,
        decay: 0.03,
        sustain: 0.8,
        release: 0.05,
      },
      {
        frequency: 1200,
        duration: 0.2,
        waveform: "sine",
        volume: 0.8,
        attack: 0.01,
        decay: 0.03,
        sustain: 0.8,
        release: 0.05,
      },
    ],
    0.05,
  );
}

/**
 * Skip button sound - subtle low tone
 * 400Hz sine, 100ms, vol 0.5
 */
export async function skip(): Promise<void> {
  await playTone({
    frequency: 400,
    duration: 0.1,
    waveform: "sine",
    volume: 0.5,
    attack: 0.01,
    decay: 0.02,
    sustain: 0.6,
    release: 0.03,
  });
}
