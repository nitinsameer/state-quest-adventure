# Task #10: Build, Test & Verify - Action Plan

## Current Status
✅ 9/11 tasks complete (82%)
- Configuration updated with all 36 states
- All 30 new state translations documented
- Integration guide prepared
- Ready for build & test phase

---

## What Needs to Happen

### Phase 1: Integrate Translations (30 min)
**Location**: `src/lib/content/states.json`

**Current State**: Has 36 states with English (en) content only

**What to Do**: Add native language translations for 30 states following the pattern from:
- GROUP1_TRANSLATIONS.md (Rajasthan, MP, Goa, Kerala, Telangana)
- GROUP2_TRANSLATIONS.md (Odisha, Bihar, Jharkhand, Chhattisgarh, UP)
- GROUP3_TRANSLATIONS.md (Uttarakhand, Haryana, Punjab, HP, Assam)
- GROUP4_5_6_TRANSLATIONS.md (Northeast + UTs)

**Pattern Example**:
```json
{
  "stateName": "Rajasthan",
  "en": { /* existing English content */ },
  "hi": {
    "capital": { "title": "🏛️ जयपुर...", "emoji": "🏛️", "mainText": "..." },
    "language": { ... },
    "food": { ... },
    "animal": { ... },
    "monument": { ... },
    "funFact": { ... }
  }
}
```

**Safe Approach**:
1. Add Group 1 (5 states) to states.json
2. Validate JSON syntax
3. Build and verify
4. Repeat for Groups 2, 3, 4, 5, 6

---

### Phase 2: Build (20 min)

```bash
cd 'd:\NishaanTech\state-quest-adventure'

# 1. Web build
npm run build

# 2. Check for errors
npm run test:states  # or equivalent

# 3. Android build
cd android
./gradlew clean assembleDebug
```

**Success Criteria**:
- ✅ No build errors
- ✅ No TypeScript errors
- ✅ No JSON parse errors
- ✅ APK generated successfully

---

### Phase 3: Test (25 min)

```bash
# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n 'com.nishaantech.exploreindia/com.nishaantech.exploreindia.MainActivity'
```

**Manual Testing - For Each Bilingual State**:

1. **Navigation**
   - [ ] Open Journey tab
   - [ ] Click on bilingual state (e.g., Rajasthan)
   - [ ] State Intro screen loads
   - [ ] No console errors

2. **Language Toggle**
   - [ ] Learning Hub opens
   - [ ] Language toggle button visible (📖/🌐)
   - [ ] Click 📖 → Shows English
   - [ ] Click 🌐 → Shows native language
   - [ ] Instant switching, no lag

3. **Content Verification**
   - [ ] Capital card shows both languages
   - [ ] Language card shows both languages
   - [ ] Food card shows both languages
   - [ ] Animal card shows both languages
   - [ ] Monument card shows both languages
   - [ ] Fun Fact shows both languages

4. **Age-Wise Filtering**
   - [ ] Change age band (4-7, 8-10, 11+)
   - [ ] Cards show/hide based on minAge/maxAge
   - [ ] Works in both English and native language

5. **TTS Narration**
   - [ ] Click narration button in English
   - [ ] Listen to English narration
   - [ ] Switch to native language (🌐)
   - [ ] Click narration button
   - [ ] Listen to native language narration
   - [ ] Narration language is correct

6. **Quiz**
   - [ ] After viewing cards, quiz appears
   - [ ] Quiz is in English only (by design)
   - [ ] Language toggle doesn't affect quiz
   - [ ] Quiz works normally

7. **Back Button**
   - [ ] Android back button returns to hub
   - [ ] Hub back button returns to intro
   - [ ] Intro back button returns to journey map
   - [ ] No jumping to home

8. **Performance**
   - [ ] State loads quickly (< 2 seconds)
   - [ ] No lag when switching languages
   - [ ] No memory issues
   - [ ] No crashes

**Test All 36 States** (or sample):
- [ ] 6 existing bilingual states (Andhra Pradesh, Gujarat, Karnataka, Maharashtra, Tamil Nadu, West Bengal)
- [ ] 5 Group 1 states (Rajasthan, MP, Goa, Kerala, Telangana)
- [ ] 5 Group 2 states (Odisha, Bihar, Jharkhand, Chhattisgarh, UP)
- [ ] 5 Group 3 states (Uttarakhand, Haryana, Punjab, HP, Assam)
- [ ] 5 Group 4 states (Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland)
- [ ] 5 Group 5 UTs (Sikkim, Tripura, Delhi, J&K, Ladakh)
- [ ] 5 Group 6 UTs (Puducherry, Chandigarh, Andaman, Lakshadweep, DNH)

---

## Detailed Test Report Template

```
STATE: ___________________
LANGUAGE CODES: en, ____

Date Tested: ___________
Tester: _________________

╔════════════════════════════════╗
║ NAVIGATION & LOADING           ║
╠════════════════════════════════╣
Journey Tab → State Click
  Status: __ (OK/FAIL)
  Load Time: __ seconds
  Errors: __ (None/Yes)
  Notes: ________________________

State Intro → Continue
  Status: __ (OK/FAIL)
  Notes: ________________________

Learning Hub Loaded
  Status: __ (OK/FAIL)
  Language Toggle Visible: Yes/No
  Toggle Position: Header ✓
  Notes: ________________________

╔════════════════════════════════╗
║ LANGUAGE SWITCHING             ║
╠════════════════════════════════╣
Click 📖 (English)
  Content Changed: Yes/No
  Correct Language: Yes/No
  Speed: Fast/Slow/Acceptable
  Errors: __ (None/Yes)

Click 🌐 (Native)
  Content Changed: Yes/No
  Correct Language: Yes/No
  Speed: Fast/Slow/Acceptable
  Errors: __ (None/Yes)
  Native Language Readable: Yes/No

╔════════════════════════════════╗
║ CARD CONTENT (in both langs)   ║
╠════════════════════════════════╣
Capital Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

Language Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

Food Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

Animal Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

Monument Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

Fun Fact Card
  EN: ____ (Appears)
  [lang]: ____ (Appears)
  Correct: Yes/No

╔════════════════════════════════╗
║ TTS NARRATION                  ║
╠════════════════════════════════╣
English Narration
  Available: Yes/No
  Plays: Yes/No
  Correct Language: Yes/No
  Quality: Good/Fair/Poor

Native Language Narration
  Available: Yes/No
  Plays: Yes/No
  Correct Language: Yes/No
  Quality: Good/Fair/Poor

╔════════════════════════════════╗
║ QUIZ                           ║
╠════════════════════════════════╣
Quiz Appears: Yes/No
Quiz Language: English (expected)
Language Toggle Ignored: Yes/No
Answers Recorded: Yes/No

╔════════════════════════════════╗
║ AGE-WISE FILTERING             ║
╠════════════════════════════════╣
Age Band 4-7
  Cards Shown: ____ (correct count)
  English: Correct/Incorrect
  Native: Correct/Incorrect

Age Band 8-10
  Cards Shown: ____ (correct count)
  English: Correct/Incorrect
  Native: Correct/Incorrect

Age Band 11+
  Cards Shown: ____ (correct count)
  English: Correct/Incorrect
  Native: Correct/Incorrect

╔════════════════════════════════╗
║ PERFORMANCE & STABILITY        ║
╠════════════════════════════════╣
Overall Performance: Good/Fair/Poor
Load Time: ____ seconds
Language Switch Speed: Instant/Fast/Slow
Crashes: 0 / ___
Console Errors: 0 / ___
Memory Issues: None / Yes

FINAL STATUS: ✅ PASS / ❌ FAIL
NOTES: _________________________
```

---

## Build & Test Commands

### Validate JSON
```bash
# Quick check
node -e "
const json = require('./src/lib/content/states.json');
console.log('✅ states.json is valid JSON');
console.log('States count:', Object.keys(json.states).length);
"
```

### Build
```bash
cd 'd:\NishaanTech\state-quest-adventure'

# Web
npm run build

# Android
cd android
./gradlew clean assembleDebug
```

### Install & Launch
```bash
# Install
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch
adb shell am start -n 'com.nishaantech.exploreindia/com.nishaantech.exploreindia.MainActivity'

# View logs
adb logcat | grep "React\|Error\|Exception"
```

### Test on Web
```bash
npm run dev
# Open http://localhost:5173 in browser
# Navigate to Journey tab
# Test language toggle and content
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| JSON parse error | Check for unescaped quotes, validate encoding (UTF-8) |
| Language toggle not appearing | Check LanguageToggle component is imported, CSS not hidden |
| Wrong text displayed | Verify translation in markdown vs. JSON, check language code match |
| TTS not working | Verify language code supported by TTS, check permissions |
| Slow performance | Check file size, consider lazy loading if needed |
| Age filtering not working | Verify minAge/maxAge fields present in all card translations |

---

## Success Criteria for Task #10

✅ **All of the following must pass**:
1. Web build succeeds without errors
2. Android APK builds successfully
3. APK installs on device
4. App launches without crashing
5. Language toggle appears for all 36 states
6. Language switching works instantly
7. All 6 card types display in both languages
8. Age-wise filtering works correctly
9. TTS narration plays in correct language
10. Quiz displays in English only
11. Android back button works correctly
12. No console errors or warnings
13. Performance is acceptable (< 2s load time)
14. All states can be accessed and tested

---

## Estimated Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Add translations to JSON | 30 min | ⏳ |
| 2 | Build (web + Android) | 20 min | ⏳ |
| 3 | Test on device | 25 min | ⏳ |
| | **TOTAL** | **75 min** | |

---

## Decision Point

**Question**: Should I proceed with Task #10 immediately?

**Recommendation**: YES

**Why**:
- All preparation complete (90%)
- No blockers identified
- Translations are ready in markdown files
- Build process is straightforward
- Testing methodology is clear

**Next Step**: Authorize to integrate translations and proceed with build/test cycle.

---

## If Issues Arise

If any issues appear during Task #10:
1. Document the issue clearly
2. Check troubleshooting guide above
3. Verify source (is it translation data or code?)
4. Report with:
   - State name
   - Language affected
   - Error message
   - Steps to reproduce
   - Screenshot if applicable

---

**Ready to begin Task #10?** Authorization needed to proceed with translation integration.
