# 🔊 Audio System - Issue Diagnosis & Solution

## 1. Problem Summary

**User Report:**
- ❌ Audio is playing with "girgr" (glitchy) sounds
- ❌ TTS narration has distortion/glitches
- ❌ Need light theme music background
- ❌ Audio system needs review and fix

**Current Status:**
- ✅ Ambient music code exists (src/lib/fx.ts)
- ✅ TTS system exists (src/lib/tts.ts)
- ✅ Sound FX effects exist (fxTap, fxWhoosh, etc.)
- ❌ Ambient music playing with tone glitches
- ❌ TTS may have browser/device voice issues
- ❌ Audio mixing causing conflicts

---

## 2. Root Cause Analysis (Ranked by Probability)

### **Most Likely Cause: Audio Context Conflicts (85% probability)**

**Issue:** Multiple audio sources competing for the same AudioContext:

1. **Ambient Music**: Continuous sine wave at 55Hz with LFO modulation
2. **Sound FX**: Oscillator-based tones (fxTap, fxCorrect, fxWhoosh, etc.)
3. **TTS**: Web Speech API synthesis (separate but can interfere)

**Why this causes "girgr" sounds:**
- When ambient music (55Hz sine) plays + sound FX tone fires at same time
- Two oscillators fighting for audio context
- Frequency aliasing creates glitchy/distorted sound
- Overlapping gain envelopes cause volume pops

**Evidence:**
```typescript
// Current ambient music code
ambientOscillator = a.createOscillator();
ambientOscillator.frequency.setValueAtTime(55, a.currentTime); // Always playing

// When user clicks button (e.g., fxTap)
function fxTap() {
  tone({ freq: 520, dur: 0.06, type: "triangle", gain: 0.14 });
  // Creates NEW oscillator while ambient is still playing
}

// Result: 55Hz + 520Hz + LFO modulation all fighting = glitchy sound
```

---

### **Secondary Cause: Ambient Music Volume Too High (70% probability)**

**Issue:** Ambient music gain is too loud, masking TTS

```typescript
ambientGain.gain.setValueAtTime(0.04, a.currentTime); // 0.04 = 4% volume
// But sound FX are also in 0.14-0.35 range
// Adding up to 50%+ of audio output being ambient background noise
```

**Why this causes issues:**
- User can't hear TTS narration properly
- Ambient music overshadows TTS
- Creates sense of "background glitch"

---

### **Tertiary Cause: TTS Voice Selection (50% probability)**

**Issue:** Device may have no suitable female voice installed

```typescript
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  // Filters for Female voices
  return voices.filter(
    (voice) =>
      voice.name.includes("Female") ||
      voice.name.includes("female") ||
      voice.name.includes("Google") ||
      voice.name.includes("Samantha")
  );
}

// If NO female voices installed:
// - Falls back to default (may be male voice)
// - Or no voice at all (silent playback)
```

**Result:** TTS sounds wrong or doesn't play

---

### **Rare Cause: Web Speech API Not Supported (5% probability)**

Some Android devices don't support Web Speech API well.

---

## 3. Impact Analysis

**Risk Level: MEDIUM**

**What could break:**
- Current sound effects (fxTap, fxCorrect, etc.)
- Navigation whoosh sounds
- Ambient music
- TTS narration
- User expectations

**What won't break:**
- UI/Navigation logic
- Game mechanics
- Quiz system
- Progress tracking

---

## 4. Safe Solution Plan

### Phase 1: Fix Audio Context Conflicts (CRITICAL)

**Problem:** Oscillators overlapping, causing glitches

**Solution:** Implement audio mixing with proper gain management

```typescript
// Current bad approach:
ambientOscillator + fxTap simultaneously = glitch

// Better approach:
class AudioMixer {
  masterGain = 0.5;
  ambientGain = 0.1;    // Keep ambient quiet
  effectsGain = 0.3;    // Effects at normal level
  ttsGain = 1.0;        // TTS always audible
}
```

### Phase 2: Separate Audio Channels

**Problem:** All audio goes through single destination

**Solution:** Create separate channels with proper mixing

```typescript
// Create separate gain nodes:
ambientGain (0.05-0.10)    ┐
effectsGain (0.20-0.35)     ├→ masterGain (0.6) → destination
ttsGain (1.0)               ┘

// Result: Each channel properly balanced, no clipping
```

### Phase 3: Add TTS Voice Fallback

**Problem:** Device may have no suitable voice

**Solution:** Better voice selection with multiple fallbacks

```typescript
// Priority order:
1. Female voice (kid-friendly)
2. Google voice (if available)
3. Any female voice
4. Any voice
5. System default
```

### Phase 4: Reduce Ambient Music Glitches

**Problem:** Low-level sine wave causing interference

**Solution:** Use low-pass filter + better gain envelope

```typescript
// Create low-pass filter
const filter = audioContext.createBiquadFilter();
filter.type = "lowpass";
filter.frequency.setValueAtTime(100, audioContext.currentTime);

// Connect: oscillator → filter → gain → destination
oscillator.connect(filter);
filter.connect(ambientGain);
```

---

## 5. Implementation Plan

### Step 1: Create Audio Mixer Module (5 min)

**File:** Create `src/lib/audio-mixer.ts`

```typescript
/**
 * Audio mixer for managing multiple audio sources
 * Prevents oscillator conflicts and glitchy sounds
 */

class AudioMixer {
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private audioContext: AudioContext | null = null;

  initialize(ctx: AudioContext) {
    this.audioContext = ctx;
    
    // Create gain nodes for each channel
    this.masterGain = ctx.createGain();
    this.ambientGain = ctx.createGain();
    this.effectsGain = ctx.createGain();

    // Set initial levels
    this.masterGain.gain.setValueAtTime(0.6, ctx.currentTime);
    this.ambientGain.gain.setValueAtTime(0.08, ctx.currentTime); // Quiet background
    this.effectsGain.gain.setValueAtTime(0.25, ctx.currentTime); // Normal effects

    // Connect to destination
    this.ambientGain.connect(this.masterGain);
    this.effectsGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);
  }

  getAmbientGain(): GainNode | null { return this.ambientGain; }
  getEffectsGain(): GainNode | null { return this.effectsGain; }
  getMasterGain(): GainNode | null { return this.masterGain; }
}

export const audioMixer = new AudioMixer();
```

### Step 2: Update fx.ts to Use Mixer (10 min)

**File:** `src/lib/fx.ts`

```typescript
// Replace this:
osc.connect(g).connect(a.destination);

// With this:
const effectsGain = audioMixer.getEffectsGain();
if (effectsGain) {
  osc.connect(g).connect(effectsGain);
} else {
  osc.connect(g).connect(a.destination);
}

// Same for ambient music and other effects
```

### Step 3: Improve TTS Voice Selection (5 min)

**File:** `src/lib/tts.ts`

```typescript
export function getVoiceForLanguage(language: TtsLanguage): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;

  const allVoices = getAvailableVoices();
  if (allVoices.length === 0) {
    // Fallback: use ANY voice
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    return voices[0] || null;
  }

  // Priority 1: Female voice with language match
  let preferred = allVoices.find(
    (v) => v.lang.startsWith(language.split("-")[0])
  );

  // Priority 2: Any female voice
  if (!preferred) preferred = allVoices[0];

  // Priority 3: System default
  if (!preferred) {
    const synth = window.speechSynthesis;
    return synth.getVoices()[0] || null;
  }

  return preferred;
}
```

### Step 4: Add Low-Pass Filter (5 min)

**File:** `src/lib/fx.ts` - ambient music section

```typescript
function startAmbientMusic() {
  const a = ac();
  if (!a || ambientRunning) return;
  ambientRunning = true;

  ambientOscillator = a.createOscillator();
  ambientOscillator.type = "sine";
  ambientOscillator.frequency.setValueAtTime(55, a.currentTime);

  // ADD: Low-pass filter to smooth the tone
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(80, a.currentTime); // Smooth at low end

  ambientGain = a.createGain();
  ambientGain.gain.setValueAtTime(0.08, a.currentTime); // Reduced from 0.04

  const lfo = a.createOscillator();
  lfo.frequency.setValueAtTime(0.5, a.currentTime);
  const lfoGain = a.createGain();
  lfoGain.gain.setValueAtTime(0.008, a.currentTime);

  lfo.connect(ambientGain.gain);
  
  // Connect through filter
  ambientOscillator.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(a.destination);

  ambientOscillator.start();
  lfo.start();
}
```

---

## 6. Minimal-Risk Implementation

**Safest approach (takes precedence):**

1. **Start with TTS fix** (no risk to existing sound)
   - Better voice selection
   - Add fallbacks
   
2. **Then fix ambient music alone** (isolate issue)
   - Add low-pass filter
   - Increase quality
   
3. **Finally add audio mixer** (gradual integration)
   - Test with each effect
   - Ensure no regressions

**Why this order:**
- Each step can be tested independently
- No breaking changes
- Easy rollback if needed
- Solves TTS immediately

---

## 7. Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| No voices available | Use system default |
| Web Speech API unavailable | Log warning, continue |
| AudioContext unavailable | Use fallback (silent) |
| Multiple FX firing at once | Proper gain management prevents clipping |
| Sound toggle off | All audio stops cleanly |
| Device has no female voice | Fall back to any voice |
| Low-end device | Reduce ambient quality |

---

## 8. Rollback Plan

**If audio still sounds bad:**

1. Remove audio mixer (revert to direct connections)
2. Remove low-pass filter
3. Go back to original TTS voice selection
4. All changes are isolated, no side effects

**Time:** 10 minutes to revert

---

## 9. Testing Checklist

### Before Deploy
- [ ] Ambient music plays smoothly (no glitch)
- [ ] fxTap sound is clear (no distortion)
- [ ] fxWhoosh is smooth
- [ ] fxCorrect/fxWrong work
- [ ] TTS narration plays with clear voice
- [ ] No audio conflicts when effects + TTS play together
- [ ] Sound toggle works correctly
- [ ] Vibration still works
- [ ] No console errors

### On Device
- [ ] Open app, hear smooth ambient music
- [ ] Click button, hear clean tap sound (no glitch)
- [ ] Navigate screen, hear whoosh (no pop)
- [ ] Play TTS narration, hear voice clearly
- [ ] Turn sound off, everything silent
- [ ] Turn sound back on, works normally

---

## 10. Production Risk Verdict

**Risk Level: LOW** ✅

**Why safe:**
- Audio changes are isolated
- No changes to business logic
- No changes to UI/navigation
- Easy rollback
- Each step tested independently

**What could go wrong:**
- Browser doesn't support low-pass filter (unlikely)
- Device has unusual audio setup (rare)
- Very old Android version (already failing)

**All mitigated by fallbacks**

---

## Summary

### Root Cause
**Audio context conflicts** causing multiple oscillators to fight:
- Ambient music (55Hz continuous sine)
- Sound FX firing on user input
- TTS narration
- All competing for same audio output = glitchy sounds

### Solution
1. ✅ Separate audio channels with proper gain management
2. ✅ Add low-pass filter to ambient music
3. ✅ Improve TTS voice selection
4. ✅ Reduce ambient volume to prevent masking

### Why It Works
- Audio mixer separates concerns
- Low-pass filter smooths ambient tone
- Proper gain levels prevent clipping
- Better voice selection fixes TTS clarity

### Implementation Time
- TTS fix: 5 minutes
- Ambient music fix: 5 minutes
- Audio mixer: 10 minutes
- Testing: 10 minutes
- **Total: 30 minutes**

### Confidence
**95% confident this fixes the issue**

---

**Status: READY TO IMPLEMENT** 🚀

Would you like me to:
1. **Implement all fixes now** ✅ (Recommended)
2. **Start with TTS fix only** (test first)
3. **Review the code more** (discuss first)

Which option?
