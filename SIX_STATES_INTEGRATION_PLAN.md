# Six States Enhancement Plan

**Current Status**: All 6 states have LANGUAGE VARIANTS ONLY  
**Goal**: Add complete ROOT-LEVEL detailed content to match other 30 states

---

## 🔍 Current Structure vs Desired Structure

### CURRENT (Language Variants Only)
```json
"Maharashtra": {
  "capital": {
    "en": {
      "title": "...",
      "mainText": "...",
      "emoji": "..."
      // No keyFacts, coolFacts, etc!
    },
    "mr": {
      "title": "...",
      "mainText": "...",
      "emoji": "..."
    }
  }
}
```

### DESIRED (Full Root-Level + Language Variants)
```json
"Maharashtra": {
  "capital": {
    "title": "🏙️ MUMBAI - The City of Dreams!",
    "emoji": "🏙️",
    "mainText": "Mumbai is India's BIGGEST and BUSIEST city!...",
    "keyFacts": [
      {"text": "Capital of Maharashtra...", "minAge": 3, "maxAge": 99},
      {"text": "Bollywood movie studios...", "minAge": 3, "maxAge": 99}
    ],
    "coolFacts": [
      {"text": "Gateway of India...", "minAge": 8, "maxAge": 99}
    ],
    "didYouKnow": {"text": "Mumbai's nickname...", "minAge": 3, "maxAge": 99},
    "tryThis": {"text": "Watch a Bollywood movie...", "minAge": 3, "maxAge": 99},
    "narration": "Mumbai is the CITY OF DREAMS...",
    "en": {
      "title": "...",
      "mainText": "...",
      "emoji": "..."
    },
    "mr": {
      "title": "...",
      "mainText": "...",
      "emoji": "..."
    }
  }
}
```

---

## 📋 The 6 States to Enhance

| # | State | Cards to Add | Language | Status |
|----|-------|------------|----------|--------|
| 1 | **Maharashtra** | capital, language, food, animal, monument, funFact | Hindi (hi) | ⏳ Ready |
| 2 | **Karnataka** | capital, language, food, animal, monument, funFact | Kannada (kn) | ⏳ Ready |
| 3 | **Tamil Nadu** | capital, language, food, animal, monument, funFact | Tamil (ta) | ⏳ Ready |
| 4 | **Gujarat** | capital, language, food, animal, monument, funFact | Gujarati (gu) | ⏳ Ready |
| 5 | **West Bengal** | capital, language, food, animal, monument, funFact | Bengali (bn) | ⏳ Ready |
| 6 | **Andhra Pradesh** | Already has content - just verify | Telugu (te) | ✅ Verify |

---

## 🎯 Content Ready

### Markdown Files Created
- ✅ `SIX_STATES_DETAILED_TRANSLATIONS.md` (Maharashtra, Karnataka, Tamil Nadu, Gujarat - partial)
- ✅ `SIX_STATES_WEST_BENGAL_COMPLETE.md` (West Bengal complete)

### Content Breakdown Per State
```
Each state needs 6 card types:
├── capital (🏛️ city with age tags)
├── language (🗣️ native language details)
├── food (🍲 traditional dish)
├── animal (🦁 state animal)
├── monument (🏰 important building)
└── funFact (🎉 interesting trivia)

Each card has:
├── title
├── emoji
├── mainText
├── keyFacts (array of objects with text, minAge, maxAge)
├── coolFacts (array of objects with text, minAge, maxAge)
├── didYouKnow (object with text, minAge, maxAge)
├── tryThis (object with text, minAge, maxAge)
├── narration
├── en (language variant)
└── [native_code] (language variant - hi/kn/ta/gu/bn)
```

---

## 📊 Integration Checklist

### Phase 1: Maharashtra ✅
- [x] Capital card created (Mumbai)
- [x] Language card created (Marathi)
- [x] Food card created (Vada Pav)
- [ ] **TODO**: Animal card (Tiger)
- [ ] **TODO**: Monument card (Ajanta Caves or Fort Raigad)
- [ ] **TODO**: FunFact card
- [ ] **TODO**: Integrate into states.json

### Phase 2: Karnataka ✅
- [x] Capital card created (Bangalore)
- [x] Language card created (Kannada)
- [x] Food card created (Dosa)
- [ ] **TODO**: Animal card (Asian Elephant)
- [ ] **TODO**: Monument card (Vidhana Soudha)
- [ ] **TODO**: FunFact card
- [ ] **TODO**: Integrate into states.json

### Phase 3: Tamil Nadu ✅
- [x] Capital card created (Chennai)
- [x] Language card created (Tamil)
- [x] Food card created (Idli)
- [ ] **TODO**: Animal card (Nilgiri Tahr)
- [ ] **TODO**: Monument card (Meenakshi Temple)
- [ ] **TODO**: FunFact card
- [ ] **TODO**: Integrate into states.json

### Phase 4: Gujarat ✅
- [x] Capital card created (Gandhinagar)
- [x] Language card created (Gujarati)
- [x] Food card created (Dhokla)
- [ ] **TODO**: Animal card (Lion)
- [ ] **TODO**: Monument card (Somnath Temple)
- [ ] **TODO**: FunFact card
- [ ] **TODO**: Integrate into states.json

### Phase 5: West Bengal ✅
- [x] Capital card created (Kolkata)
- [x] Language card created (Bengali)
- [x] Food card created (Hilsa)
- [ ] **TODO**: Animal card (Bengal Tiger)
- [ ] **TODO**: Monument card (Victoria Memorial)
- [ ] **TODO**: FunFact card
- [ ] **TODO**: Integrate into states.json

### Phase 6: Andhra Pradesh ✅
- [x] Already has language variants
- [ ] **TODO**: Verify completeness
- [ ] **TODO**: Ensure all facts have age tags

---

## 🔧 Integration Process

### Step 1: Prepare Content
1. Create animal cards for each state
2. Create monument cards for each state
3. Create funFact cards for each state
4. Ensure ALL facts have `{"text": "...", "minAge": X, "maxAge": 99}`

### Step 2: Add to states.json
For each state:
```json
"StateNa me": {
  "stateName": "StateName",
  "capital": { /* full card with keyFacts, coolFacts, etc */ },
  "language": { /* full card */ },
  "food": { /* full card */ },
  "animal": { /* full card */ },
  "monument": { /* full card */ },
  "funFact": { /* full card */ }
}
```

### Step 3: Validate
- Run `npm run build`
- Check for JSON errors
- Test on device

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Create 10 remaining cards (2 per state) | 1-2 hours |
| Integrate into states.json | 30 mins |
| Verify JSON structure | 15 mins |
| Build and test | 30 mins |
| **TOTAL** | **2-3 hours** |

---

## 📌 Key Files to Modify

1. `src/lib/content/states.json` - Main file to update
2. Markdown files for reference:
   - `SIX_STATES_DETAILED_TRANSLATIONS.md`
   - `SIX_STATES_WEST_BENGAL_COMPLETE.md`

---

## ✅ Done vs TODO

### ✅ DONE
- ✅ Created 3 card types for 5 states (capital, language, food)
- ✅ Created all 3 cards for West Bengal
- ✅ All facts tagged with minAge/maxAge
- ✅ All language variants included (en + native)
- ✅ Narration for TTS support

### 📝 TODO
- [ ] Create animal cards (5 states)
- [ ] Create monument cards (5 states)
- [ ] Create funFact cards (5 states)
- [ ] Merge all content into states.json
- [ ] Test build: `npm run build`
- [ ] Test on device: `adb install` + launch

---

## 🎯 Next Command

**Would you like me to:**

1. **Complete all missing cards** (animal, monument, funFact for 5 states)
2. **Create integration script** to merge all content
3. **Both - do it all at once**

---

*Six States Enhancement Plan - Ready for Implementation*
