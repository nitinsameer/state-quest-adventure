# Plan: Bilingual Support for All 30 Remaining States

## Overview
Convert all 30 remaining states/UTs to bilingual format (English + Native Language) following the proven pattern of the 6 existing bilingual states.

## Architecture (Proven Pattern - From 6 Existing States)
```
State Card Content Structure:
{
  "en": { capital, language, food, animal, monument, funFact },
  "xx": { capital, language, food, animal, monument, funFact }  // xx = language code
}
```

### Language Code Mapping (ISO 639-1)
| Language | Code | Script |
|----------|------|--------|
| Hindi | hi | Devanagari |
| Tamil | ta | Tamil |
| Telugu | te | Telugu |
| Kannada | kn | Kannada |
| Malayalam | ml | Malayalam |
| Gujarati | gu | Gujarati |
| Marathi | mr | Marathi |
| Punjabi | pa | Punjabi (Gurmukhi) |
| Bengali | bn | Bengali |
| Odia | or | Odia |
| Konkani | kok | Devanagari |
| Assamese | as | Assamese |
| Khasi | kha | Latin (No native script standard) |
| Mizo | miz | Latin (No native script standard) |
| Meitei | mni | Meitei Mayek |
| Kashmiri | ks | Perso-Arabic/Devanagari |
| Ladakhi | lbj | Devanagari |
| Nepali | ne | Devanagari |
| Chhattisgarhi | hne | Devanagari |

## 30 Remaining States/UTs Grouped by Language

### Group 1: Hindi-Speaking States (9 states)
1. **Rajasthan** → Hindi (hi)
2. **Madhya Pradesh** → Hindi (hi)
3. **Uttar Pradesh** → Hindi (hi)
4. **Bihar** → Hindi (hi)
5. **Jharkhand** → Hindi (hi)
6. **Chhattisgarh** → Chhattisgarhi (hne)
7. **Uttarakhand** → Hindi (hi)
8. **Haryana** → Hindi (hi)
9. **Delhi (UT)** → Hindi (hi)

### Group 2: Southern States - Dravidian Languages (3 states)
1. **Odisha** → Odia (or)
2. **Kerala** → Malayalam (ml)
3. **Telangana** → Telugu (te)

### Group 3: Western States (2 states)
1. **Goa** → Konkani (kok)
2. **Punjab** → Punjabi (pa)

### Group 4: Himalayan & Northeast States (7 states)
1. **Himachal Pradesh** → Hindi (hi)
2. **Assam** → Assamese (as)
3. **Arunachal Pradesh** → English (en) - No major native script
4. **Manipur** → Meitei (mni)
5. **Meghalaya** → Khasi (kha)
6. **Mizoram** → Mizo (miz)
7. **Nagaland** → English (en) - No major native script

### Group 5: Union Territories (8 UTs)
1. **Jammu & Kashmir** → Kashmiri (ks)
2. **Ladakh** → Ladakhi (lbj)
3. **Sikkim** → Nepali (ne)
4. **Tripura** → Bengali (bn)
5. **Puducherry** → Tamil (ta)
6. **Chandigarh** → Punjabi (pa)
7. **Andaman & Nicobar Islands** → Hindi (hi)
8. **Lakshadweep** → Malayalam (ml)
9. **Dadra & Nagar Haveli and Daman & Diu** → Gujarati (gu)

## Implementation Phases

### Phase 1: Configuration Update (Task #2)
- Update `src/lib/bilingual-config.ts` with all 30 states
- Add entries to `BILINGUAL_STATES` array
- Define language codes and native language names

### Phase 2: Translation Extraction & Implementation (Tasks #3-#8)
- **Group 1 (5 states)**: Rajasthan, Madhya Pradesh, Goa, Kerala, Telangana
- **Group 2 (5 states)**: Odisha, Bihar, Jharkhand, Chhattisgarh, Uttar Pradesh
- **Group 3 (5 states)**: Uttarakhand, Haryana, Punjab, Himachal Pradesh, Assam
- **Group 4 (5 states)**: Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland
- **Group 5 (5 UTs)**: Sikkim, Tripura, Delhi, Jammu & Kashmir, Ladakh
- **Group 6 (5 UTs)**: Puducherry, Chandigarh, Andaman & Nicobar Islands, Lakshadweep, Dadra & Nagar Haveli

### Phase 3: Verification & Testing (Tasks #9-#10)
- JSON validation
- Build & deploy
- Language toggle testing
- Age-wise filtering testing
- TTS narration testing

### Phase 4: Production Finalization (Task #11)
- Create checklist
- Disable testing mode
- Final deployment

## Content Requirements Per State
Each state needs translations for:
1. **Capital** - City name in native language
2. **Language** - Official language name in native language
3. **Food** - Iconic dish name in native language
4. **Animal** - State animal in native language
5. **Monument** - Iconic monument name in native language
6. **Fun Fact** - 1-2 sentence fact in native language

## Data Structure Example (From Andhra Pradesh - Already Complete)
```json
{
  "name": "Andhra Pradesh",
  "en": {
    "capital": "Amaravati",
    "language": "Telugu",
    "food": "Pulihora",
    "animal": "Blackbuck",
    "monument": "Tirupati Temple",
    "funFact": "Its spicy chillies travel all over the world."
  },
  "te": {
    "capital": "అమరావతి",
    "language": "తెలుగు",
    "food": "పులిహోర",
    "animal": "నలుపరి",
    "monument": "తిరుపతి ఆలయం",
    "funFact": "దీని తీవ్ర మిర్చిలు ప్రపంచం నలలకు ప్రయాణం చేస్తాయి."
  }
}
```

## User Experience Flow (Unchanged)
1. User navigates to any bilingual state from Journey tab
2. Learning Hub displays language toggle (📖/🌐) in header
3. Click toggle to switch between English ↔ Native Language
4. Cards display in selected language with age-wise filtering
5. Quiz always in English (by design)
6. TTS narration matches selected language
7. Language choice resets on next visit (not persisted)

## Success Criteria
- ✅ All 30 states added to BILINGUAL_STATES
- ✅ All content in states.json has {en: {...}, xx: {...}} structure
- ✅ Language toggle appears for all 30 states in Learning Hub
- ✅ Age-wise filtering works for all card types in both languages
- ✅ TTS narration available in all native languages
- ✅ Quiz always in English regardless of language selection
- ✅ Builds successfully (web + Android)
- ✅ APK installs and runs on device
- ✅ No crashes or console errors

## Estimated Timeline
- Configuration: 30 min
- Translations (6 groups): 4-5 hours
- Verification: 1 hour
- Testing & Build: 1 hour
- **Total: ~6-7 hours**

## Notes
- Some states (Arunachal Pradesh, Nagaland) don't have widely standardized native scripts, so English remains the native language
- Khasi, Mizo, and Meitei use Latin/native scripts, content will be in those scripts
- All translations must maintain accuracy and cultural authenticity
- TTS support for all languages must be verified on device
