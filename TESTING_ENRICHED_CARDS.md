# 🎓 Enriched Cards Testing Guide

## ✅ BROWSER TESTING (Desktop)

### Setup
- Dev server running at: http://localhost:8080/
- Open in Chrome, Firefox, Safari, or Edge

### Test Path: Complete a State → View Enriched Cards

1. **Open Home Page**
   - URL: http://localhost:8080/
   - Click "Get Started" → Create Profile → Select State

2. **Navigate to Complete a State**
   - Open any state (e.g., Rajasthan)
   - Complete the learning journey (quiz, etc.)
   - You'll see the "Postcard Screen"

3. **On Postcard Screen**
   - Look for new button: "📚 Learn More Cards"
   - Click it
   - You should navigate to the enriched cards screen

### Test #1: Card Display ✨

**What to check:**
- [ ] 6 cards are visible as emoji tabs at the bottom
- [ ] Cards are: 🏛️ 🗣️ 🍲 🏰 🐪 🏜️
- [ ] Click each tab → card content changes
- [ ] Smooth animation when switching cards
- [ ] Card title shows at top (e.g., "🏛️ JAIPUR - The PINK CITY!")

**Evidence of Success:**
```
Tab 1: Shows "🏛️ JAIPUR - The PINK CITY!" 
Tab 2: Shows "🗣️ HINDI - Let's Learn!"
Tab 3: Shows "🍲 DAL BAATI - The YUMMIEST FOOD!"
(etc for all 6)
```

---

### Test #2: Expandable Facts 📖

**What to check (on each card):**
- [ ] "✨ Cool Facts" button exists
- [ ] Click to expand
- [ ] Facts appear with animation (fade in)
- [ ] "Show 3 More Facts ⭐" button appears when facts > 3
- [ ] Click "Show More" → more facts appear
- [ ] Button text updates: "Hide Facts" when expanded

**Evidence of Success:**
```
Capital Card:
- Main text visible
- ✨ Cool Facts button
- 3 facts showing
- "+ Show 3 More Facts ⭐" button visible
- Click it → 3 more facts appear
```

---

### Test #3: TTS Narration 🔊

**Setup:**
- Make sure Sound is ON in Profile settings
- Check system volume is not muted

**What to check:**
- [ ] Play button (▶️) appears in "Listen to Story" section
- [ ] Button is blue/cyan colored
- [ ] Click play
- [ ] Button changes to pause (⏸️) and glows
- [ ] Audio plays (you should HEAR narration)
- [ ] Audio respects speech rate (slightly slower for kids)
- [ ] Progress bar animates during playback
- [ ] Click pause → stops audio
- [ ] Progress bar shows "Playing... tap to stop"

**Expected Audio:**
```
"Jaipur is the PINK CITY! Imagine walking down a street where 
EVERYTHING is pink - the walls, the shops, even the air feels pink! 🌸

Long, long ago, a clever king wanted visitors to feel super welcome, 
so he painted the WHOLE city pink - the color of love! 💕
..."
```

**Evidence of Success:**
- You hear the narration voice
- It's slightly slower than normal speech
- Female child-friendly voice
- Narration matches the text

---

### Test #4: Sound Toggle Mute ✅

**What to check:**
- [ ] Go to Profile → "Sound & Vibration"
- [ ] Toggle OFF (sound muted)
- [ ] Return to enriched card screen
- [ ] Play button should show 🔇 (muted icon)
- [ ] Play button disabled/grayed out
- [ ] Text says "🔇 Sound is off in settings"
- [ ] Try clicking play → nothing happens
- [ ] Toggle sound back ON
- [ ] Play button becomes active again
- [ ] Can play audio again

**Evidence of Success:**
```
Sound ON:
- Play button: blue, clickable
- Text: "Tap play to hear! 👂"

Sound OFF:
- Play button: grayed out, muted icon 🔇
- Text: "🔇 Sound is off in settings"
- Button disabled
```

---

### Test #5: Card Navigation 🎯

**What to check:**
- [ ] Tab bar at bottom shows 6 emoji tabs
- [ ] Active tab is highlighted (different color)
- [ ] Inactive tabs are dimmer
- [ ] Click on any tab → switches instantly
- [ ] Card content updates
- [ ] Narration resets (doesn't auto-play from previous)
- [ ] Info text updates: "1 of 6 • Capital", "2 of 6 • Language", etc

**Evidence of Success:**
```
Active Tab: bg-orange-50 border-orange-200 (highlighted, larger)
Inactive Tabs: bg-white/50 (smaller, dimmer)
Info bar changes: "1 of 6 • JAIPUR", "2 of 6 • HINDI", etc
```

---

### Test #6: Back Button ◀️

**What to check:**
- [ ] Header has back button (‹)
- [ ] Click it
- [ ] Navigate back to postcard screen
- [ ] Postcard screen still visible
- [ ] Audio stops when navigating away

**Evidence of Success:**
```
Click ‹ → Back to postcard screen with "Save / Share Postcard"
```

---

### Test #7: Responsive Design 📱

**What to check on Desktop:**
- [ ] Open browser DevTools (F12)
- [ ] Toggle to mobile view (375px width)
- [ ] All text readable
- [ ] Cards not cramped
- [ ] Tabs are scrollable
- [ ] Play button accessible
- [ ] No horizontal scroll needed

**Evidence of Success:**
- Cards are readable at mobile width
- Text not truncated
- No layout breakage

---

## 🎬 MANUAL VERIFICATION STEPS

### Step 1: Start Dev Server ✅
```
npm run dev
```
Output should show:
```
VITE v8.2.2 ready in XXX ms
➜ Local: http://localhost:8080/
```

### Step 2: Open Browser
- Chrome: http://localhost:8080/
- Firefox: http://localhost:8080/
- Edge: http://localhost:8080/

### Step 3: Navigate to Enriched Cards
1. Click "Get Started"
2. Create a profile
3. Select Rajasthan
4. Complete any learning activity (or skip to postcard)
5. Click "📚 Learn More Cards"
6. You should see the enriched card screen!

### Step 4: Test Each Tab
Go through each card:

**Tab 1 - 🏛️ JAIPUR**
- Main text: "Imagine a whole city painted PINK!..."
- Expand facts → see 10+ facts
- Play narration → hear Jaipur story

**Tab 2 - 🗣️ HINDI**
- Main text: "80 out of 100 kids in Rajasthan speak Hindi!..."
- Expand facts → see 10+ facts with "NAMASTE", "RAJASTHAN", etc
- Play narration → hear Hindi story

**Tab 3 - 🍲 DAL BAATI**
- Main text: "DAL = Soft beans... BAATI = Round bread..."
- Expand facts → see recipe, nutrition, history
- Play narration → hear food story

**Tab 4 - 🏰 HAWA MAHAL**
- Main text: "The WEIRDEST, COOLEST building with 953 TINY windows!..."
- Expand facts → see 11+ facts about windows, history
- Play narration → hear Hawa Mahal story

**Tab 5 - 🐪 CAMEL**
- Main text: "Camels are SUPERPOWERS animal!..."
- Expand facts → see 17+ facts about humps, survival, etc
- Play narration → hear camel story

**Tab 6 - 🏜️ THAR DESERT**
- Main text: "Bigger than Israel! AMAZING! 5 MILLION people live here!..."
- Expand facts → see 15+ facts about size, temperature, animals
- Play narration → hear desert story

### Step 5: Test Audio Muting
1. Go to Profile → "Sound & Vibration"
2. Toggle OFF
3. Return to enriched cards
4. Play button should be disabled
5. Toggle sound back ON
6. Try playing audio → should work again

---

## ✅ SUCCESS CRITERIA

- [ ] All 6 cards display correctly
- [ ] Tab navigation works smoothly
- [ ] Expandable facts show/hide
- [ ] TTS audio plays
- [ ] Audio respects mute toggle
- [ ] Back button works
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🐛 TROUBLESHOOTING

**Issue: Play button not working**
- Check system volume is ON
- Check Sound & Vibration is enabled in Profile
- Try refreshing page
- Check browser console for errors (F12)

**Issue: No audio**
- Check Sound & Vibration toggle in Profile
- Try different browser
- Check system volume
- Try clicking play again

**Issue: Cards not showing**
- Make sure you completed a state quiz
- Check if Rajasthan is available
- Look at browser console (F12) for errors

**Issue: Text overlapping**
- Try different browser zoom (Ctrl + 0)
- Try mobile view (DevTools)

---

## 📊 TESTING CHECKLIST

**Functionality:**
- [ ] All 6 cards render
- [ ] Tab switching works
- [ ] Expandable facts work
- [ ] TTS plays audio
- [ ] Mute toggle respected
- [ ] Back navigation works

**UI/UX:**
- [ ] Colors are kid-friendly
- [ ] Text is readable
- [ ] Buttons are responsive
- [ ] Layout is clean
- [ ] No visual glitches

**Audio:**
- [ ] Narration is clear
- [ ] Speed is appropriate
- [ ] Volume is good
- [ ] Playback controls work

**Performance:**
- [ ] No lag when switching tabs
- [ ] Audio loads quickly
- [ ] No console errors

---

## 📝 TEST REPORT TEMPLATE

```
TEST DATE: ___________
TESTER: ___________
BROWSER: ___________
DEVICE: ___________

✅ PASSED:
- Cards display correctly
- TTS narration plays
- Mute toggle works
- Navigation works

⚠️ ISSUES FOUND:
- [Issue 1]
- [Issue 2]

📝 NOTES:
[Additional observations]
```

---

## 🚀 NEXT: ANDROID TESTING

Once browser testing is complete, proceed to:
1. Build APK: `npm run build && cd android && ./gradlew build`
2. Install: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
3. Launch: `adb shell am start -n dev.lovable.build/.MainActivity`
4. Test the same scenarios on the device

---
