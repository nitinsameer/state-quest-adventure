# Browser Audio System Testing Checklist

**Dev Server:** ✅ Running at http://localhost:8080/  
**Status:** Ready for manual testing  
**Date:** September 1, 2026

---

## Audio Features Implemented

### 1. ✅ Ambient Background Music
- **What:** Looping subtle ambient drone (55Hz sine wave + LFO modulation + low-pass filter)
- **Where:** Plays throughout entire app (except when muted)
- **Volume:** 8% (quiet background)
- **Control:** Respects Sound toggle in settings

### 2. ✅ Tap/Click Sound Effects
- **What:** Short beep on button clicks
- **Where:** All navigation buttons, screen transitions
- **Volume:** 25% (normal)
- **Buttons Covered:**
  - BottomNav (Home, Journey, Passport, Badges, Me)
  - Quiz answer selections
  - Quiz check answer button
  - Card navigation buttons
  - Continue/Next buttons
  - All major screen transitions

### 3. ✅ Text-to-Speech (TTS) Narration
- **What:** Kids read card content when play button pressed
- **Where:** "Learn More Cards" screen for each state
- **Voice:** Prefers female voices (kid-friendly)
- **Fallback:** Any available system voice
- **Controls:** Play/pause button, respects Sound toggle

### 4. ✅ App Lifecycle Audio Management
- **On Minimize:** Ambient stops, TTS pauses
- **On Resume:** Ambient restarts, TTS resumes
- **Note:** Only on native (Android/iOS), web doesn't trigger this

### 5. ✅ Audio Permission Dialog (COPPA Compliant)
- **What:** Kid-friendly permission request
- **When:** First app launch (level 0)
- **Complies With:** Google Play Families Policy
- **No Dark Patterns:** Simple yes/no, no manipulation

### 6. ✅ Sound Toggle Integration
- **Location:** Profile/Me screen settings
- **Effect:** Instantly mutes all audio (ambient, effects, TTS)
- **Persisted:** Setting saved to localStorage

---

## Browser Testing Steps

### Test 1: Ambient Music Loop
**Expected:** Hear a smooth, low humming tone in background

1. Open http://localhost:8080/
2. Click "Create a Traveler" to start
3. Wait 3-5 seconds
4. **Listen for:** Low ambient hum (very quiet but audible)
5. **Result:** __ PASS / __ FAIL

---

### Test 2: Audio Permission Dialog
**Expected:** See kid-friendly permission dialog on first launch

1. Open http://localhost:8080/ in a NEW incognito/private window
2. Clear localStorage first: Open DevTools → Application → Clear All
3. Refresh page
4. **Look for:** Dialog asking "Can we play sounds? 🔊"
5. **Dialog should have:**
   - Speaker icon
   - Benefits list (game sounds, music, stories)
   - "Yes please!" and "No thanks" buttons
   - Parental note at bottom
6. **Click:** "Yes please!"
7. **Result:** __ PASS / __ FAIL

---

### Test 3: Tap Sound Effects
**Expected:** Hear beep when clicking buttons

1. Navigate to any state (Rajasthan, etc.)
2. Click any button multiple times:
   - Bottom navigation buttons
   - "Learn More Cards" button
   - "Got it! Next" button
3. **Listen for:** Distinct beep on each click
4. **Result:** __ PASS / __ FAIL

---

### Test 4: TTS Narration
**Expected:** Hear robot voice read content

1. Navigate to any state
2. Click "Learn More Cards"
3. You should see card with speaker icon (▶️)
4. Click the play button
5. **Listen for:** Clear voice narration of card text
6. **Expected voice:** Female, friendly tone
7. Click pause (⏸️) to stop
8. **Result:** __ PASS / __ FAIL

---

### Test 5: TTS Voice Quality
**Expected:** Natural, kid-appropriate voice

1. In "Learn More Cards", click play on any card
2. **Listen for:**
   - Clear pronunciation
   - Natural speed (not too fast)
   - Friendly tone (not robotic)
   - No stuttering or glitches
3. **Result:** __ PASS / __ FAIL

---

### Test 6: Sound Toggle OFF
**Expected:** All audio stops when turned off

1. Go to "Me" (profile screen)
2. Find Sound & Vibration toggle
3. **Toggle OFF** (disable sound)
4. Try all audio:
   - Click buttons → no beep
   - TTS button disabled (grayed out)
   - Ambient music silent
5. **Result:** __ PASS / __ FAIL

---

### Test 7: Sound Toggle ON
**Expected:** Audio resumes when turned on

1. With sound OFF, toggle **ON**
2. **Immediately hear:**
   - Ambient music returns
   - Can click buttons for beeps
   - TTS button enabled (blue)
3. **Result:** __ PASS / __ FAIL

---

### Test 8: Ambient + Effects Together
**Expected:** No interference, both play simultaneously

1. Let ambient play for 5 seconds
2. While ambient playing, rapidly click buttons 5 times
3. **Listen for:**
   - Ambient continues smooth
   - Beeps play clearly over ambient
   - No glitches or cuts
4. **Result:** __ PASS / __ FAIL

---

### Test 9: Quiz Sounds
**Expected:** Specific sounds for quiz feedback

1. Navigate to Quiz
2. Answer WRONG → **Listen for:** Descending buzz sound
3. Try another question
4. Answer CORRECTLY → **Listen for:** Ascending chime (high notes)
5. **Result:** __ PASS / __ FAIL

---

### Test 10: Device Volume Control
**Expected:** All audio respects device volume

1. Open browser DevTools (F12)
2. Open mobile device simulator (Chrome DevTools → Toggle Device Toolbar)
3. Listen to ambient music
4. **Lower system volume** (or mute device)
5. **Audio should:** Respond to system volume
6. **Unmute** and **increase volume**
7. **Audio should:** Get louder
8. **Result:** __ PASS / __ FAIL

---

### Test 11: Audio Across Screens
**Expected:** Ambient continues seamlessly between screens

1. In any state, listen for ambient
2. Navigate between screens:
   - Click bottom nav items
   - Go to quiz
   - Go back to cards
   - Change states
3. **Ambient should:**
   - Never cut out
   - Never restart/loop awkwardly
   - Stay smooth throughout
4. **Result:** __ PASS / __ FAIL

---

### Test 12: TTS Interrupt
**Expected:** Stopping TTS works cleanly

1. In "Learn More Cards", click play on card narration
2. Wait 2 seconds (mid-speech)
3. Click pause (⏸️)
4. **Audio should:** Stop immediately, cleanly
5. Click play again
6. **Audio should:** Resume (or restart) without glitches
7. **Result:** __ PASS / __ FAIL

---

### Test 13: Multiple TTS Attempts
**Expected:** Switching between cards works correctly

1. In "Learn More Cards" with 6 cards
2. Play audio on Card 1
3. After 2 seconds, switch to Card 2 tab
4. Click play on Card 2
5. **Audio should:** Stop Card 1, start Card 2 (no overlap)
6. Try switching multiple times rapidly
7. **Result:** __ PASS / __ FAIL

---

### Test 14: Browser Tab Blur (Web Only)
**Expected:** Audio continues in background (browser feature)

1. Open app in browser tab
2. Listen to ambient + play TTS
3. **Switch to another browser tab**
4. **Audio might:** Continue or pause (browser dependent)
5. **Switch back to app tab**
6. **Audio should:** Still work
7. **Result:** __ PASS / __ FAIL

---

### Test 15: Rapid Button Clicks
**Expected:** No audio glitches from rapid input

1. Click same button 10 times rapidly
2. **Audio should:**
   - No crackling/popping
   - No missing beeps
   - Each beep distinct
   - Volume consistent
3. **Result:** __ PASS / __ FAIL

---

## Audio Mixer Technical Details

**Gain Levels:**
- Master Gain: 60%
- Ambient Channel: 8% (very quiet)
- Effects Channel: 25% (normal)
- TTS: Uses system volume

**Low-Pass Filter (Ambient Only):**
- Type: Biquad lowpass
- Cutoff: 80 Hz
- Purpose: Smooth ambient tone, remove digital artifacts

**Routing:**
```
Ambient (55Hz + LFO) → Low-Pass Filter (80Hz) → Ambient Gain (8%) ↘
                                                                    Master Gain (60%) → Speaker
Effects (Tap/Beeps) → Effects Gain (25%) ↗
```

---

## Browser Console Logs to Check

Open DevTools (F12) and watch Console for these logs:

**On App Start:**
```
[AudioMixer] Initialized with proper gain management
[TTS] Using language-specific voice: [voice name]
```

**When Sound Toggle Changed:**
```
Sound muted/unmuted
```

**Audio Permission Dialog:**
```
Audio permission shown
User accepted/rejected audio permission
```

---

## Issues to Report

If you encounter any of these, note it:

| Issue | Severity | Action |
|-------|----------|--------|
| No ambient music at all | Critical | Check console logs |
| Tap sounds don't work | Critical | Check Sound toggle |
| TTS doesn't play | High | Try different browser |
| Audio cuts out between screens | High | Check audio mixer logs |
| Permission dialog doesn't show | Medium | Check localStorage |
| Audio glitches/crackling | Medium | Check device volume |
| Very quiet/very loud | Low | Adjust mixer gains |

---

## Report Template

```
TEST: [Test Number + Name]
EXPECTED: [What should happen]
ACTUAL: [What actually happened]
BROWSER: [Chrome/Firefox/Safari/Edge + version]
DEVICE: [Desktop/Mobile/Emulator]
CONSOLE ERRORS: [Any red text in DevTools]
REPRODUCIBLE: [Always / Sometimes / Once]
NOTES: [Any additional details]
```

---

## Success Criteria

✅ **All tests PASS** = Audio system ready for Android deployment

❌ **Critical tests FAIL** = Debug and fix before deploying

⚠️ **Non-critical tests FAIL** = Document as known limitation

---

## Next Steps After Testing

1. ✅ If all tests pass:
   - Run `npm run build`
   - Sync to Android: `npx cap sync android`
   - Build APK: `cd android && ./gradlew.bat build -x lint`
   - Install and test on device

2. ❌ If tests fail:
   - Check console logs in browser DevTools
   - Verify Sound toggle is ON
   - Try clearing localStorage (CTRL+SHIFT+DEL)
   - Try different browser (Chrome recommended)
   - Check device volume is not muted

---

**Test Server:** http://localhost:8080/  
**Status:** 🟢 Ready for Testing  
**Time to Complete:** ~15-20 minutes  

**Go test! 🎵**
