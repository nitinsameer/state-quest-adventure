# Which Format is Correct? - The Definitive Answer

**Date**: September 12, 2026  
**Analysis**: Based on actual app code review

---

## 🎯 THE ANSWER: ANDHRA PRADESH FORMAT IS CORRECT

### Andhra Pradesh ✅ (CORRECT)
```json
"keyFacts": [
  {"text": "...", "minAge": 3, "maxAge": 99},
  {"text": "...", "minAge": 6, "maxAge": 99},
  {"text": "...", "minAge": 8, "maxAge": 99}
]
```

### Rajasthan ❌ (INCORRECT - Missing Age Tags)
```json
"keyFacts": [
  "Built in 1727 by Maharaja Sawai Jai Singh II",
  "~45 Lakh people live here",
  "Why PINK? Because pink = WELCOME! 🎨"
]
```

---

## 🔍 PROOF - From App Code

### In `src/lib/state-content.ts`

```typescript
// This is the TYPE definition - facts should be AgeTaggedContent
export type CardContent = {
  keyFacts: string[] | AgeTaggedContent[];  // ← Can be EITHER
  coolFacts?: string[] | AgeTaggedContent[];
  didYouKnow?: string | AgeTaggedContent;
  tryThis?: string | AgeTaggedContent;
};

// Age-tagged content type definition
export type AgeTaggedContent = {
  text: string;
  minAge: number;      // ← minAge is REQUIRED
  maxAge: number;      // ← maxAge is REQUIRED
};
```

### The Filtering Function

```typescript
function filterByAge(
  content: (string | AgeTaggedContent)[] | undefined, 
  ageBand: string
): string[] {
  if (!content) return [];
  
  const userAge = getNumericAge(ageBand);
  
  return content
    .filter((item) => {
      // If it's a string (old format), show it to EVERYONE
      if (typeof item === 'string') return true;
      
      // If it's age-tagged, CHECK AGE LIMITS
      const tagged = item as AgeTaggedContent;
      return userAge >= tagged.minAge && userAge <= tagged.maxAge;
    })
    .map((item) => {
      return typeof item === 'string' ? item : (item as AgeTaggedContent).text;
    });
}
```

### Where It's Used

```typescript
// In src/components/screens.tsx line 1687:
let cardContent = enrichedCard ? getCardContentByAge(
  stateName, 
  def.enrichedKey, 
  displayLanguage, 
  ageBand  // ← User's age is passed in
) : null;

// Which calls getCardContentByAge function:
export function getCardContentByAge(
  stateName: string,
  cardType: string,
  language: string = 'en',
  ageBand: string = '8-9'
): CardContent | null {
  const content = getCardContent(stateName, cardType, language);
  if (!content) return null;

  // ← Filter by age
  return {
    title: content.title,
    emoji: content.emoji,
    mainText: content.mainText,
    keyFacts: filterByAge(content.keyFacts, ageBand),    // ← Age filtering here
    narration: content.narration,
    coolFacts: filterByAge(content.coolFacts, ageBand),  // ← Age filtering here
    didYouKnow: filterFactByAge(content.didYouKnow, ageBand),  // ← Age filtering
    tryThis: filterFactByAge(content.tryThis, ageBand),  // ← Age filtering
  };
}
```

---

## 📊 What This Means

### How App Handles Age Filtering

**Age Bands**:
- "3-5" (Sprout) → numeric age 4
- "6-7" (Seedling) → numeric age 6.5
- "8-9" (Sapling) → numeric age 8.5
- "10-12" (Mighty Tree) → numeric age 11

### Example: User is Sprout (Age 3-5)

**With Andhra Pradesh Format (✅ CORRECT)**:
```
Reading Capital Card Facts...

Check fact 1: minAge=3, maxAge=99
→ Is 4 >= 3 AND 4 <= 99? YES ✅ Show it

Check fact 2: minAge=6, maxAge=99
→ Is 4 >= 6 AND 4 <= 99? NO ❌ Hide it

Check fact 3: minAge=8, maxAge=99
→ Is 4 >= 8 AND 4 <= 99? NO ❌ Hide it

Result: 1 fact shown
```

**With Rajasthan Format (❌ WRONG)**:
```
Reading Capital Card Facts...

Check fact 1: "Built in 1727..."
→ Is it a string? YES
→ Show to EVERYONE ✅ Show it

Check fact 2: "~45 Lakh people..."
→ Is it a string? YES
→ Show to EVERYONE ✅ Show it

Check fact 3: "Why PINK?..."
→ Is it a string? YES
→ Show to EVERYONE ✅ Show it

Result: ALL 3 facts shown (no age filtering!)
```

---

## 🚨 The Problem with Rajasthan

**Rajasthan is showing ALL facts to ALL ages!**

```
5-year-old sees: All 8 facts in capital card
7-year-old sees: All 8 facts in capital card
10-year-old sees: All 8 facts in capital card
```

**But should be**:
```
5-year-old sees: Only facts marked minAge: 3
7-year-old sees: Facts marked minAge: 3-6
10-year-old sees: All facts (minAge: 3-8)
```

---

## ✅ THE CORRECT FORMAT

Rajasthan facts SHOULD look like this:

```json
{
  "capital": {
    "title": "🏛️ JAIPUR - The PINK CITY!",
    "emoji": "🌸",
    "mainText": "Imagine a whole city painted PINK!...",
    "keyFacts": [
      {
        "text": "Built in 1727 by Maharaja Sawai Jai Singh II",
        "minAge": 3,
        "maxAge": 99
      },
      {
        "text": "~45 Lakh people live here",
        "minAge": 3,
        "maxAge": 99
      },
      {
        "text": "Why PINK? Because pink = WELCOME! 🎨",
        "minAge": 3,
        "maxAge": 99
      },
      {
        "text": "Hawa Mahal has 953 tiny windows! 🪟",
        "minAge": 6,
        "maxAge": 99
      },
      {
        "text": "City Palace is still a real palace - the king's family LIVES there! 👑",
        "minAge": 6,
        "maxAge": 99
      },
      {
        "text": "Jantar Mantar = Giant stone telescope 🔭",
        "minAge": 6,
        "maxAge": 99
      },
      {
        "text": "Street food: Mirchi Pakora, Ker Sangri, Fafda Jalebi 🍜",
        "minAge": 6,
        "maxAge": 99
      },
      {
        "text": "Best time to visit: October-March 🌤️",
        "minAge": 3,
        "maxAge": 99
      }
    ],
    "coolFacts": [
      {
        "text": "The pink color was chosen because pink represents HOSPITALITY...",
        "minAge": 6,
        "maxAge": 99
      },
      // ... more facts with minAge/maxAge
    ],
    "didYouKnow": {
      "text": "Jaipur gets its nickname 'The Pink City'...",
      "minAge": 3,
      "maxAge": 99
    },
    "tryThis": {
      "text": "Next time you see something pink...",
      "minAge": 3,
      "maxAge": 99
    }
  }
}
```

---

## 🎯 Recommendation

### What To Do

**Option 1: Fix Rajasthan to Match AP (RECOMMENDED)**
- Add minAge/maxAge to all facts
- Apply to all 5 Group 1 states (Rajasthan, MP, Goa, Kerala, Telangana)
- Apply to all 30 remaining states
- **Result**: Proper age-appropriate content for all users
- **Effort**: Medium (need to tag each fact)
- **File Size**: Larger (+30-40% due to metadata)

**Option 2: Keep Current + Document**
- Keep Rajasthan as simple strings (current)
- Document that Rajasthan is NOT age-filtered
- Accept that 5-year-olds see same content as 10-year-olds
- **Result**: Simpler JSON, less age filtering
- **Effort**: None
- **Risk**: Kids get content not suited for their age

---

## 📋 Summary Table

| Aspect | Andhra Pradesh | Rajasthan | Best |
|--------|----------------|-----------|------|
| **Has minAge/maxAge?** | ✅ YES | ❌ NO | AP ✅ |
| **Age filtering works?** | ✅ YES | ❌ NO | AP ✅ |
| **5-year-olds see appropriate content?** | ✅ YES | ❌ NO | AP ✅ |
| **JSON complexity** | 🟡 Medium | 🟢 Simple | Raj |
| **File size** | 🔴 Larger | 🟢 Smaller | Raj |
| **App code supports it?** | ✅ YES | ⚠️ Partially | AP ✅ |

---

## 🏆 FINAL VERDICT

### Andhra Pradesh Format is CORRECT ✅

**Reason**: App code is designed for and expects the AgeTaggedContent format with minAge/maxAge

### Rajasthan Format is INCOMPLETE ❌

**Reason**: Missing minAge/maxAge means age filtering doesn't work

### Required Fix

Convert all facts to AgeTaggedContent format:
```
String:  "Built in 1727..."
Object:  {"text": "Built in 1727...", "minAge": 3, "maxAge": 99}
```

---

*Which Format is Correct - Complete Analysis*

**Verdict: Andhra Pradesh Format is the Correct Pattern**

**Next Step**: Should we fix Rajasthan and all 30 states?
