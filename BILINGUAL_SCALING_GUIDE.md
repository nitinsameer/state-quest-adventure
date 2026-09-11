# Bilingual States Scaling Guide

## Overview

This guide explains how to add the next 5 bilingual states following the Andhra Pradesh (AP) benchmark.

**What Changed:**
- ✅ Removed hardcoded `stateName === "Andhra Pradesh"` check
- ✅ Created config-driven framework (`bilingual-config.ts`)
- ✅ Language toggle automatically appears for ANY state in the config
- ✅ Logic is identical for all bilingual states

**The Pattern (Andhra Pradesh):**
- Learning Hub: Shows language toggle in top-left corner
- User can switch between English + Native Language
- Language selection applies only to learning cards
- Quiz always uses English (by design, prevents translation burden)
- Language state not persisted (resets on revisit)

---

## How It Works

### 1. Configuration (`src/lib/bilingual-config.ts`)

All bilingual states are defined in one place:

```typescript
export const BILINGUAL_STATES: BilingualStateConfig[] = [
  {
    stateName: "Andhra Pradesh",
    languages: ["en", "te"],
    nativeLanguage: "te",
    nativeLanguageName: "Telugu",
  },
  // Add more states here
];
```

### 2. Helper Functions

Three simple helpers power the entire system:

```typescript
isBilingual("Tamil Nadu")           // → true/false
getAvailableLanguages("Tamil Nadu") // → ["en", "ta"]
getNativeLanguage("Tamil Nadu")     // → "ta"
```

### 3. UI Integration (`screens.tsx`)

The language toggle uses the config:

```tsx
{isBilingual(stateName) && (
  <LanguageToggle
    currentLanguage={displayLanguage}
    availableLanguages={getAvailableLanguages(stateName)}
    onLanguageChange={(lang) => setDisplayLanguage(lang)}
    variant="header"
  />
)}
```

### 4. Content Structure (`states.json`)

Bilingual states have language variants for all 6 card types:

```json
{
  "stateName": "Tamil Nadu",
  "languageCode": "ta",
  "capital": {
    "en": { "title": "...", "mainText": "...", "keyFacts": [...] },
    "ta": { "title": "...", "mainText": "...", "keyFacts": [...] }
  },
  "language": { "en": {...}, "ta": {...} },
  "food": { "en": {...}, "ta": {...} },
  "places": { "en": {...}, "ta": {...} },
  "animal": { "en": {...}, "ta": {...} },
  "funFact": { "en": {...}, "ta": {...} }
}
```

---

## Adding the Next 5 States

### Step 1: Add to Config (`src/lib/bilingual-config.ts`)

Uncomment and fill in the next 5 states:

```typescript
export const BILINGUAL_STATES: BilingualStateConfig[] = [
  {
    stateName: "Andhra Pradesh",
    languages: ["en", "te"],
    nativeLanguage: "te",
    nativeLanguageName: "Telugu",
  },
  {
    stateName: "Tamil Nadu",
    languages: ["en", "ta"],
    nativeLanguage: "ta",
    nativeLanguageName: "Tamil",
  },
  {
    stateName: "Karnataka",
    languages: ["en", "kn"],
    nativeLanguage: "kn",
    nativeLanguageName: "Kannada",
  },
  {
    stateName: "Maharashtra",
    languages: ["en", "mr"],
    nativeLanguage: "mr",
    nativeLanguageName: "Marathi",
  },
  {
    stateName: "West Bengal",
    languages: ["en", "bn"],
    nativeLanguage: "bn",
    nativeLanguageName: "Bengali",
  },
  {
    stateName: "Gujarat",
    languages: ["en", "gu"],
    nativeLanguage: "gu",
    nativeLanguageName: "Gujarati",
  },
];
```

**That's it!** The UI automatically enables language toggle for these states.

### Step 2: Verify Content Structure

For each new state in `src/lib/content/states.json`:

**BEFORE (Single Format - Non-Bilingual):**
```json
{
  "stateName": "Tamil Nadu",
  "capital": {
    "title": "Chennai - The Gateway of South",
    "mainText": "...",
    "keyFacts": [...]
  }
}
```

**AFTER (Variant Format - Bilingual):**
```json
{
  "stateName": "Tamil Nadu",
  "languageCode": "ta",
  "capital": {
    "en": {
      "title": "Chennai - The Gateway of South",
      "mainText": "...",
      "keyFacts": [...]
    },
    "ta": {
      "title": "சென்னை - தெற்கின் வாயிל்",
      "mainText": "...",
      "keyFacts": [...]
    }
  },
  "language": { "en": {...}, "ta": {...} },
  "food": { "en": {...}, "ta": {...} },
  "places": { "en": {...}, "ta": {...} },
  "animal": { "en": {...}, "ta": {...} },
  "funFact": { "en": {...}, "ta": {...} }
}
```

**Checklist:**
- [ ] All 6 card types have `{en: {...}, langCode: {...}}` format
- [ ] Each language variant has same fields: `title`, `mainText`, `keyFacts`, `narration`, `coolFacts`, `didYouKnow`, `tryThis`
- [ ] `languageCode` field added to state root (for TTS)
- [ ] No mixing: Either full variant format OR keep as single (don't mix both)

### Step 3: Test Locally

1. Update config with new state
2. Build: `npm run build`
3. Launch app and navigate to state
4. Verify language toggle appears in top-left corner
5. Verify switching language updates card content
6. Verify quiz works (should use English)
7. Verify age-filtering still works

### Step 4: Build and Deploy

```bash
# Fresh build
npm run build

# Rebuild Android
cd android
./gradlew clean assembleDebug

# Install
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Test on device
```

---

## Content Structure Details

### All 6 Card Types Must Support Variants

Each state has these 6 card types (learning hub):

1. **capital** - State capital
2. **language** - Local language info
3. **food** - Famous food/cuisine
4. **places** - Tourist places
5. **animal** - State animal/wildlife
6. **funFact** - Fun/trivia fact

For bilingual states, each has both language variants.

### Each Variant Must Have These Fields

```typescript
{
  title: string;                      // Card title
  mainText: string;                   // Main content
  emoji?: string;                     // Optional emoji
  keyFacts: KeyFact[];                // Bullet points with age groups
  narration?: string;                 // Audio narration
  coolFacts?: string[];               // Fun facts list
  didYouKnow?: string;                // Trivia section
  tryThis?: string;                   // Interactive challenge
}

// KeyFact structure
{
  fact: string;
  ageGroups: ("5-7" | "8-10" | "11-13" | "14-17")[];
}
```

---

## Edge Cases & Safeguards

### 1. Missing Translation

If a translation is incomplete:

```typescript
// In getCardContentByLanguage() - Line 51-59
// Falls back automatically:
// 1. Try requested language
// 2. Fall back to 'en'
// 3. Fall back to first available
```

Users see English content instead of broken state. Safe!

### 2. Three+ Languages

Current toggle handles 2 languages (cycles between them).

For future 3+ languages, use dropdown instead of toggle:

```tsx
// For Tamil Nadu (en + ta) - works as toggle
// For India Hindi (en + hi) - works as toggle
// For future multilingual - use dropdown
```

### 3. RTL Languages (Future)

If adding Arabic, Urdu, etc., layout needs adjustment:

```tsx
// Currently: LTR only
// For RTL: Add dir="rtl" to card container
// Impact: Minimal (one prop change)
```

---

## Production Safety Checklist

Before going live with new bilingual states:

- [ ] Config added to `BILINGUAL_STATES`
- [ ] All 6 card types have variant format
- [ ] Both language variants have same field structure
- [ ] `languageCode` field added to state
- [ ] Language toggle appears in learning hub
- [ ] Language toggle disappears if only 1 language
- [ ] Switching language updates card content
- [ ] Quiz uses English (verify in logs)
- [ ] Age filtering works with new language
- [ ] No console errors or warnings
- [ ] App doesn't crash on any state
- [ ] Builds clean without errors
- [ ] Release build verified (not just debug)

---

## Rollback Strategy

If a new bilingual state breaks the app:

1. **Remove from config** - Single line in `bilingual-config.ts`
2. **Rebuild** - `npm run build`
3. **Deploy** - One APK install
4. **No data loss** - Config change only, no DB migrations

Instant rollback, zero risk!

---

## Architecture: Why This Works

### Before (Hardcoded)

```typescript
if (stateName === "Andhra Pradesh") {
  // Show language toggle
  // ...specific logic...
}
```

**Problem:** Every new state needs new code.

### After (Config-Driven)

```typescript
if (isBilingual(stateName)) {
  // Show language toggle for ANY bilingual state
  // ...generic logic...
}
```

**Benefit:** Add new state = update config only, no code changes!

---

## Performance Impact

### Memory

- Config: ~500 bytes (6 states × ~80 bytes)
- One `isBilingual()` call per screen load
- Negligible impact

### Load Time

- No impact (helpers are O(1) lookups)
- Content loading unchanged

### Bundle Size

- New file: ~2KB
- Plus helper imports: negligible
- Total impact: <5KB

---

## Future Enhancements (Not Required Now)

1. **Persist Language** - Save user's language choice per state
   - Complexity: Medium (add to progress DB)
   - Benefit: User starts in preferred language on revisit

2. **Quiz in Native Language** - Optional language-specific quizzes
   - Complexity: High (need translated questions)
   - Benefit: Better learning retention

3. **Dropdown for 3+ Languages** - Instead of 2-way toggle
   - Complexity: Low (UI change only)
   - Benefit: Supports unlimited languages per state

4. **Admin UI** - Manage bilingual states without code
   - Complexity: High (new dashboard)
   - Benefit: Non-technical teams can add states

---

## Support & Debugging

### Language toggle not appearing?

```typescript
// Check in browser console
import { isBilingual } from "@/lib/bilingual-config";
isBilingual("Tamil Nadu"); // Should be true
```

### Content showing wrong language?

```typescript
// Check state.json structure
// Ensure all 6 card types have { en: {...}, ta: {...} } format
// No mixing of single and variant formats
```

### Quiz showing wrong language?

By design - quiz always uses English.

If quiz should use native language, update:
- `src/lib/quiz.ts` line 72-77
- Call `getCardContentByLanguage()` instead of `extractEnglishValue()`

---

## Timeline for Next 5 States

| State | Languages | Estimated Content Time | Integration |
|-------|-----------|----------------------|------------|
| Tamil Nadu | en + ta | 4-6 hours | 5 mins |
| Karnataka | en + kn | 4-6 hours | 5 mins |
| Maharashtra | en + mr | 4-6 hours | 5 mins |
| West Bengal | en + bn | 4-6 hours | 5 mins |
| Gujarat | en + gu | 4-6 hours | 5 mins |

**Total Time:** ~25-30 hours content + 30 mins integration

---

## Questions?

Refer to:
- `src/lib/bilingual-config.ts` - Configuration details
- `src/lib/state-content.ts` - Content retrieval logic
- `src/components/screens.tsx` line 1936 - UI integration
- `src/lib/content/states.json` - Example bilingual state (Andhra Pradesh)

