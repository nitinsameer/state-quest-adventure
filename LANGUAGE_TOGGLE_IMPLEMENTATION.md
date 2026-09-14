# 🌐 Language Toggle Implementation Guide

## Current Status
✅ **Language Toggle Active** - All 6 bilingual states have header language button
✅ **Position:** Next to audio (🔊) button in top-right
✅ **Styling:** 10x10px compact button with 📖/🌐 emoji indicators

---

## 🏗️ Architecture

### How Language Toggle Works

1. **Detection:** `isBilingual()` checks if state is in BILINGUAL_STATES config
2. **Rendering:** If bilingual, `<LanguageToggle variant="header" />` renders in header
3. **Switching:** Click button → `setDisplayLanguage()` → cards re-render in new language
4. **Content:** `getCardContentByAge()` retrieves content in selected language + age band

### Component Hierarchy

```
LearningCardScreen (screens.tsx:1767)
  ├─ Header with: Back ← | Progress | Count | 🌐 LanguageToggle | 🔊 Audio
  └─ Card content (filtered by displayLanguage + ageBand)
```

---

## 📋 Configuration Files

### 1. **Bilingual States List**
**File:** `src/lib/bilingual-config.ts`

```typescript
export const BILINGUAL_STATES: BilingualStateConfig[] = [
  {
    stateName: "Andhra Pradesh",
    languages: ["en", "te"],     // English + Telugu
    nativeLanguage: "te",
    nativeLanguageName: "Telugu",
  },
  // ... 5 more states (Gujarat, Karnataka, Maharashtra, Tamil Nadu, West Bengal)
];
```

**To add new bilingual state:**
```typescript
{
  stateName: "New State",
  languages: ["en", "xx"],       // xx = language code
  nativeLanguage: "xx",
  nativeLanguageName: "Language Name",
}
```

### 2. **Language Toggle Component**
**File:** `src/components/LanguageToggle.tsx`

```typescript
export function LanguageToggle({
  currentLanguage,
  availableLanguages,  // ["en", "te"]
  onLanguageChange,
  variant = "card",    // "card" or "header"
})
```

**Header variant** (compact, for learning screen):
```
📖  <- Shows when English selected
🌐  <- Shows when native language selected
```

### 3. **Content Structure**
**File:** `src/lib/content/states.json`

All 6 card types have bilingual structure:
```json
{
  "capital": {
    "en": {
      "title": "Capital City Name",
      "mainText": "...",
      "keyFacts": [{text: "...", minAge: 3, maxAge: 99}],
      "narration": "..."
    },
    "te": {
      "title": "రాజధాని",
      "mainText": "...",
      "keyFacts": [{text: "...", minAge: 3, maxAge: 99}],
      "narration": "..."
    }
  }
}
```

---

## 🔧 Implementation in LearningCardScreen

```typescript
// 1. Detect if bilingual
{isBilingual(stateName) && (
  <LanguageToggle
    currentLanguage={displayLanguage as LanguageCode}
    availableLanguages={getAvailableLanguages(stateName)}
    onLanguageChange={(lang) => setDisplayLanguage(lang)}
    variant="header"  // ← Compact header style
  />
)}

// 2. Render cards based on language + age
const cards = useMemo(() => {
  return learningCardsFor(state.name, displayLanguage, progress.ageBand);
}, [state.name, displayLanguage, progress.ageBand]);

// 3. Get content with age filtering
const cardContent = getCardContentByAge(
  stateName,
  cardType,
  displayLanguage,  // "en" or "te" etc
  ageBand          // "3-5", "6-7" etc
);
```

---

## ✅ All 6 Bilingual States

| State | Code | Language | Status |
|-------|------|----------|--------|
| Andhra Pradesh | te | Telugu | ✅ Working |
| Gujarat | gu | Gujarati | ✅ Working |
| Karnataka | kn | Kannada | ✅ Working |
| Maharashtra | mr | Marathi | ✅ Working |
| Tamil Nadu | ta | Tamil | ✅ Working |
| West Bengal | bn | Bengali | ✅ Working |

### Verification Checklist

For each state, verify:
- [ ] Language toggle appears in header (next to 🔊)
- [ ] Click toggles between 📖 (English) and 🌐 (native language)
- [ ] Cards display in selected language
- [ ] Age-wise content still filters correctly
- [ ] TTS narration plays in selected language
- [ ] Can toggle language mid-card

---

## 🧪 Testing Language Toggle

### Test Case 1: Toggle between languages
1. Open any bilingual state (e.g., Gujarat)
2. See capital card in English
3. Click 🌐 button → Should show 📖 icon
4. Card content switches to Gujarati
5. Click 📖 button → Back to English

### Test Case 2: Language persists across cards
1. Select Gujarati (🌐)
2. Click "Next" → Next card loads
3. Language should still be Gujarati
4. Toggle back to English
5. Go to previous card → Should be English

### Test Case 3: Age filtering + language
1. User age band: 3-5 (Sprout)
2. Select Gujarati
3. keyFacts shown should be age-appropriate (minAge ≤ 4, maxAge ≥ 4)
4. Even in Gujarati, only age-appropriate facts shown

---

## 🐛 Troubleshooting

### Language button not showing?
- [ ] Check state is in BILINGUAL_STATES array
- [ ] Verify states.json has bilingual structure `{en: {...}, langCode: {...}}`
- [ ] Check isBilingual() returns true for state

### Cards not switching language?
- [ ] Verify getCardContent() has both language variants
- [ ] Check setDisplayLanguage() is updating state
- [ ] Confirm getAvailableLanguages() returns correct language codes

### Content showing wrong language?
- [ ] Check JSON structure - all card types must have both languages
- [ ] Verify language code matches (e.g., "gu" not "guj")
- [ ] Look for typos in native language content

---

## 📱 Visual Layout (Header)

```
[✕ Close] [Progress Bar] [3/15] [🌐 Language] [🔊 Audio]
```

- 10x10px white round buttons
- 📖 icon = English selected
- 🌐 icon = Native language selected
- Shadow & hover effects for UX

---

## 🚀 Adding New Bilingual State

### Step 1: Add to config
File: `src/lib/bilingual-config.ts`
```typescript
{
  stateName: "New State",
  languages: ["en", "xx"],
  nativeLanguage: "xx",
  nativeLanguageName: "Name",
}
```

### Step 2: Add bilingual content to JSON
File: `src/lib/content/states.json`
```json
{
  "capital": {
    "en": { title, mainText, keyFacts: [], ... },
    "xx": { title, mainText, keyFacts: [], ... }
  },
  // Repeat for: language, food, places, animal, funFact
}
```

### Step 3: Build & Deploy
```bash
npm run build
cd android && ./gradlew clean assembleDebug
adb install -r app-debug.apk
```

### Step 4: Test
- Open new state
- Verify 🌐 button appears
- Toggle language works
- Content switches correctly

---

## 📚 Related Files

- Component: `src/components/LanguageToggle.tsx`
- Config: `src/lib/bilingual-config.ts`
- Content Functions: `src/lib/state-content.ts`
- Screen: `src/components/screens.tsx` (LearningCardScreen, line ~1767)
- Content Data: `src/lib/content/states.json`

---

## ✨ Key Features

✅ **Automatic Detection** - isBilingual() checks config
✅ **Header Integration** - Compact 10x10 button next to audio
✅ **Age Filtering** - Works with bilingual + age-appropriate content
✅ **TTS Support** - Narration plays in selected language
✅ **State Persistence** - Language choice persists while viewing cards
✅ **Smooth UI** - Icon changes, no page reload needed

---

**Status:** ✅ FULLY IMPLEMENTED & TESTED
**Last Updated:** 2026-09-12
**All 6 States:** ✅ Bilingual with language toggle
