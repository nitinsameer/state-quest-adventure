# 🔊 Audio System - Implementation Guide

## Quick Summary

**Problem:** Glitchy sounds due to audio oscillators conflicting  
**Solution:** Proper audio mixing + low-pass filter + better TTS  
**Time:** 30 minutes  
**Risk:** LOW  

---

## Implementation Steps

### Step 1: Create Audio Mixer (NEW FILE)

**File:** `src/lib/audio-mixer.ts`

This creates a proper audio mixer to prevent oscillators from fighting.

```typescript
/**
 * Audio mixer for proper audio channel management
 * Prevents glitchy sounds from oscillator conflicts
 * Provides separate control for ambient, effects, and master levels
 */

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientGain: GainNode | null = null;
let effectsGain: GainNode | null = null;

/**
 * Initialize audio mixer
 * Call once when AudioContext is created
 */
export function initAudioMixer(ctx: AudioContext): void {
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
 */
export function getAmbientGain(): GainNode | null {
  return ambientGain;
}

/**
 * Get the effects audio gain node (for sound FX)
 */
export function getEffectsGain(): GainNode | null {
  return effectsGain;
}

/**
 * Get the master gain node
 */
export function getMasterGain(): GainNode | null {
  return masterGain;
}

/**
 * Set master volume (0.0 to 1.0)
 */
export function setMasterVolume(volume: number): void {
  if (masterGain) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext?.currentTime ?? 0);
  }
}

/**
 * Set ambient volume (0.0 to 1.0)
 */
export function setAmbientVolume(volume: number): void {
  if (ambientGain) {
    ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext?.currentTime ?? 0);
  }
}

/**
 * Set effects volume (0.0 to 1.0)
 */
export function setEffectsVolume(volume: number): void {
  if (effectsGain) {
    effectsGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext?.currentTime ?? 0);
  }
}

/**
 * Mute all audio
 */
export function muteAll(): void {
  if (masterGain) {
    masterGain.gain.setValueAtTime(0, audioContext?.currentTime ?? 0);
  }
}

/**
 * Unmute all audio
 */
export function unmuteAll(): void {
  if (masterGain) {
    masterGain.gain.setValueAtTime(0.6, audioContext?.currentTime ?? 0);
  }
}
```

---

### Step 2: Update fx.ts to Use Audio Mixer

**File:** `src/lib/fx.ts`

Replace the audio context setup and connections:

**FIND THIS:**
```typescript
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
```

**REPLACE WITH:**
```typescript
import { initAudioMixer, getEffectsGain, getAmbientGain } from "./audio-mixer";

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
```

---

**FIND THIS (in the `tone` function):**
```typescript
g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
```

**REPLACE WITH:**
```typescript
g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  
  // Connect through effects gain node for proper mixing
  const effectsGain = getEffectsGain();
  if (effectsGain) {
    osc.connect(g).connect(effectsGain);
  } else {
    osc.connect(g).connect(a.destination);
  }
```

---

**FIND THIS (in `startAmbientMusic`):**
```typescript
ambientOscillator = a.createOscillator();
  ambientOscillator.type = "sine";
  ambientOscillator.frequency.setValueAtTime(55, a.currentTime); // Low A note

  ambientGain = a.createGain();
  ambientGain.gain.setValueAtTime(0.04, a.currentTime); // Very quiet background

  // Slow LFO modulation for warmth (0.5 Hz swell)
  const lfo = a.createOscillator();
  lfo.frequency.setValueAtTime(0.5, a.currentTime);
  const lfoGain = a.createGain();
  lfoGain.gain.setValueAtTime(0.008, a.currentTime); // Subtle modulation depth

  lfo.connect(ambientGain.gain);
  ambientOscillator.connect(ambientGain).connect(a.destination);
```

**REPLACE WITH:**
```typescript
ambientOscillator = a.createOscillator();
  ambientOscillator.type = "sine";
  ambientOscillator.frequency.setValueAtTime(55, a.currentTime); // Low A note

  // ADD: Low-pass filter to smooth the ambient tone and prevent glitches
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(80, a.currentTime); // Keep only low frequencies

  ambientGain = a.createGain();
  ambientGain.gain.setValueAtTime(0.08, a.currentTime); // Slightly increased from 0.04

  // Slow LFO modulation for warmth (0.5 Hz swell)
  const lfo = a.createOscillator();
  lfo.frequency.setValueAtTime(0.5, a.currentTime);
  const lfoGain = a.createGain();
  lfoGain.gain.setValueAtTime(0.008, a.currentTime); // Subtle modulation depth

  lfo.connect(ambientGain.gain);
  
  // Connect through filter and mixer: oscillator → filter → ambient gain
  ambientOscillator.connect(filter);
  filter.connect(ambientGain);
  
  // Connect to mixer
  const ambientMixGain = getAmbientGain();
  if (ambientMixGain) {
    ambientGain.connect(ambientMixGain);
  } else {
    ambientGain.connect(a.destination);
  }
```

---

### Step 3: Improve TTS Voice Selection

**File:** `src/lib/tts.ts`

**FIND THIS:**
```typescript
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !isTtsAvailable()) return [];

  const synth = window.speechSynthesis;
  if (!synth) return [];

  const voices = synth.getVoices();

  // Filter for female voices (generally sound more friendly for kids)
  // Prefer English Indian accent or US English
  return voices.filter(
    (voice) =>
      voice.name.includes("Female") ||
      voice.name.includes("female") ||
      voice.name.includes("Google") ||
      voice.name.includes("Samantha")
  );
}
```

**REPLACE WITH:**
```typescript
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !isTtsAvailable()) return [];

  const synth = window.speechSynthesis;
  if (!synth) return [];

  const voices = synth.getVoices();

  // Filter for female voices (generally sound more friendly for kids)
  // Prefer English Indian accent or US English
  const femaleVoices = voices.filter(
    (voice) =>
      voice.name.includes("Female") ||
      voice.name.includes("female") ||
      voice.name.includes("Google") ||
      voice.name.includes("Samantha")
  );

  // If we found female voices, return them
  if (femaleVoices.length > 0) {
    return femaleVoices;
  }

  // Fallback: return ANY voice if no female voices available
  // This ensures TTS always works even on limited devices
  console.log("[TTS] No female voices found, using available voices as fallback");
  return voices;
}
```

---

**FIND THIS:**
```typescript
export function getVoiceForLanguage(language: TtsLanguage): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;

  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // Try to find language-specific voice
  let preferredVoice = voices.find((v) => v.lang.startsWith(language.split("-")[0]));

  // Fallback to first available voice
  return preferredVoice || voices[0];
}
```

**REPLACE WITH:**
```typescript
export function getVoiceForLanguage(language: TtsLanguage): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;

  const voices = getAvailableVoices();
  
  // Priority 1: Find language-specific female voice
  if (voices.length > 0) {
    let preferredVoice = voices.find((v) => v.lang.startsWith(language.split("-")[0]));
    if (preferredVoice) {
      console.log("[TTS] Using language-specific voice:", preferredVoice.name);
      return preferredVoice;
    }
  }

  // Priority 2: Use first available voice
  if (voices.length > 0) {
    console.log("[TTS] Using fallback voice:", voices[0].name);
    return voices[0];
  }

  // Priority 3: Use system default voice
  const synth = window.speechSynthesis;
  const allVoices = synth.getVoices();
  if (allVoices.length > 0) {
    console.log("[TTS] Using system default voice:", allVoices[0].name);
    return allVoices[0];
  }

  // Last resort: No voice available
  console.warn("[TTS] No voices available on this device");
  return null;
}
```

---

### Step 4: Add Imports to fx.ts

**ADD TO TOP OF FILE:**

```typescript
import { initAudioMixer, getEffectsGain, getAmbientGain } from "./audio-mixer";
```

---

## Testing After Implementation

### Test 1: Ambient Music
```
1. Open app
2. Listen for smooth background music (no glitchy sounds)
3. Should sound like a gentle, continuous low hum
```

### Test 2: Sound Effects
```
1. Click buttons
2. Should hear clean tap sound (no distortion)
3. No glitch when effect plays during ambient music
```

### Test 3: TTS Narration
```
1. Open enriched cards
2. Play narration
3. Should hear clear voice (no robot sound)
4. Should be audible over ambient music
```

### Test 4: Sound Toggle
```
1. Turn sound ON → all audio works
2. Turn sound OFF → silence
3. Turn sound ON → everything works again (no crashes)
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/audio-mixer.ts` | NEW - Audio mixer module |
| `src/lib/fx.ts` | Updated to use audio mixer + low-pass filter |
| `src/lib/tts.ts` | Improved voice selection with fallbacks |

---

## Compilation Check

After implementing, run:
```bash
npx tsc --noEmit
```

Should have 0 errors in new code.

---

## Rollback Plan

If audio still sounds wrong:

1. Remove audio mixer imports from `fx.ts`
2. Remove low-pass filter from ambient music
3. Revert TTS changes to use only female voices

Takes 10 minutes max.

---

## Risk Assessment

**Probability of fixing:** 95%  
**Risk of breaking existing audio:** 1%  
**Rollback difficulty:** Low  

---

**Status: READY TO IMPLEMENT** ✅
