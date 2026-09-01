# 🎮 Card Replay Feature - Executive Summary

## The Issue

**User Problem:**
- ❌ Once a card is marked "done," users can't replay it
- ❌ If user gets the answer wrong, card is locked
- ❌ No way to reinforce learning
- ❌ Frustration when exploring previous cards

**Current Behavior:**
```
User reads Card 1 → Card marked as "done" → Card is locked → No replay
```

---

## The Solution

**Proposed Behavior:**
```
User reads Card 1 → Card marked as "done" ✓
                 ↓ (User can still see it)
User taps Card 1 again (Replay) ↓
                 → Shows "📖 Replaying - No XP" indicator
                 → Card plays again
                 → XP does NOT increase
                 → Replay count increments
```

---

## Key Features

### ✅ Allow Replays
- Users can tap any completed card
- Card content plays/shows again
- Navigation feels natural

### ✅ Protect XP (No Double Earning)
- First read: +25 XP (stored in `cards[]`)
- Replays: +0 XP (tracked in `replayCount[]`)
- User sees indicator: "📖 Replaying - No XP earned this time"

### ✅ Track Learning Engagement
- New `replayCount` field: `{ "Rajasthan": { "0": 2, "1": 1 } }`
- Useful for: Analytics, understanding which cards need clarification

### ✅ Fully Backward Compatible
- Old user progress still works
- New field is optional
- No breaking changes

---

## Implementation at a Glance

### Changes Required

**File 1: `src/lib/progress.ts`**
```typescript
// Add one line to Progress type
replayCount?: Record<string, Record<number, number>>;

// Modify markCard() function
// Current: return p (no change if already read)
// New: track replay but don't award XP
```

**File 2: `src/components/screens.tsx`**
```typescript
// In LearningCardScreen.handleNext()
// New: check if this is a replay, pass flag to markCard()

// Add UI indicator
// New: show "📖 Replaying - No XP" badge when replaying
```

---

## Safety Guarantees

| Concern | How We Handle It |
|---------|-----------------|
| **Double XP** | Check `cards[]` array before awarding XP |
| **Data Loss** | Replay count persisted in localStorage |
| **Old Users** | New field is optional, auto-created |
| **Crashes** | No new APIs, just tracking |
| **Navigation** | Already allows card rewinding, just fixing UI |

---

## Risk Assessment

**Risk Level: LOW** ✅

| Aspect | Risk | Mitigation |
|--------|------|-----------|
| Code complexity | Low | ~20 lines of code changes |
| Breaking changes | None | Optional field, default behavior unchanged |
| XP Abuse | Low | Explicit check prevents double earning |
| Rollback difficulty | Easy | Just remove `isReplay` parameter |
| User confusion | Low | Clear "Replaying" indicator |

---

## What's NOT Changing

✅ XP earning on first read (still 25 XP per card)  
✅ Quiz system (still prevents double XP via `answered[]`)  
✅ State completion rewards (still 100 XP)  
✅ Navigation flow (already works)  
✅ Profile/settings (no changes)  
✅ Other states (Rajasthan logic applies to all states)  

---

## Implementation Plan

### Step 1: Update Progress Type
- Add `replayCount?` field to `Progress` type
- **Time:** 2 minutes | **Risk:** None

### Step 2: Modify `markCard()` Logic
- Add `isReplay` parameter (optional)
- Track replays without awarding XP
- **Time:** 5 minutes | **Risk:** Low

### Step 3: Update UI Logic
- Detect when card is being replayed
- Pass flag to `markCard()`
- Show "📖 Replaying" indicator
- **Time:** 10 minutes | **Risk:** Low

### Step 4: Test on Device
- Replay a card, verify no XP increase
- Check persistence on app restart
- Verify UI shows correctly
- **Time:** 10 minutes | **Risk:** None

---

## User Experience Flow

```
[Learning Hub] → User sees 6 cards with checkmarks ✓
                      ↓ (clicks card 3)
             [Card 3] Replaying indicator shows
                      Content displays
                      🔊 TTS plays
                      "📖 Replaying - No XP" shows
                      ↓ (taps Next)
             [Card 4] or [Quiz]
```

---

## Metrics

| Metric | Before | After |
|--------|--------|-------|
| Cards locked after first read | All | None |
| Ability to review learning | No | Yes |
| XP abuse potential | Low | Very Low |
| User engagement | Baseline | +Learning reinforcement |
| Code complexity | Current | +20 lines |

---

## Rollback Plan

**If something breaks:**

1. Remove replay tracking code (10 seconds)
2. Stop showing "Replaying" indicator (1 line)
3. Feature gracefully disables, XP protection stays
4. No user data loss, no app crash

---

## Next Steps

**Option 1: Approve & Implement**
- I'll implement the 3 changes above
- Test on your device
- Deploy in next release

**Option 2: Ask Questions**
- Have concerns about the plan?
- Want to adjust replay logic?
- Need clarification on something?

**Option 3: Modify the Plan**
- Want different replay behavior?
- Want different XP rules?
- Want different UI indicator?

---

## FAQ

**Q: Will users exploit this to farm XP?**  
A: No. XP only awarded on first read. Replays explicitly show "No XP" indicator.

**Q: What if user has already completed cards?**  
A: Old data still works. `replayCount` field is new but optional. They can still replay.

**Q: Does this affect quiz retakes?**  
A: No. Quiz has its own deduplication via `answered[]` array. Unchanged.

**Q: What about analytics?**  
A: Replay count tracked for future insights. Only first read fires "card read" event.

**Q: Can I disable replays later?**  
A: Yes. Just revert the UI changes. Data is preserved.

---

## Confidence Level

✅ **99% Confident This Is Safe**

- Minimal code changes
- No breaking changes
- Clear XP protection
- Easy rollback
- Production-tested patterns

---

**Ready to implement?** 🚀  
**Need to discuss first?** 💬  
**Want to modify?** ✏️
