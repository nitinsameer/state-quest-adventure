# 🎮 Card Replay Feature - Production-Safe Implementation Plan

## 1. Understanding

**User Request:**
- Users should be able to replay cards after completing them
- XP should NOT be earned again (only on first completion)
- Replays should be encouraged for learning reinforcement
- Current: Once card is marked done, it can't be replayed at all

**Business Value:**
- Encourages learning reinforcement
- Increases time-on-app (engagement)
- Prevents frustration (accidental wrong choice locks out card)
- Better learning outcomes (repetition helps)

---

## 2. Impact Analysis

### Risk Level: **MEDIUM**

### Files Impacted

**Core State Management:**
1. `src/lib/progress.ts` — Add replay tracking, modify XP award logic
2. `src/components/screens.tsx` — Update LearningCardScreen UI to show replay state

**Related (Validation Only):**
3. `src/components/screens.tsx` — LearningHubScreen (verify card selection still works)
4. `src/components/screens.tsx` — QuizScreen (no changes needed)

### Potential Break Areas

❌ **Risk 1: Double-XP Earning**
- If replay logic breaks, users could earn XP multiple times
- Mitigation: Add explicit replay check in `markCard()`

❌ **Risk 2: State Persistence**
- If replay tracking not persisted, user loses progress on app restart
- Mitigation: Add `replays` field to Progress type and persist to localStorage

❌ **Risk 3: UI Confusion**
- If UI doesn't clearly show "This is a replay," users get confused
- Mitigation: Add visual indicator (badge/label) on replay cards

❌ **Risk 4: Analytics/Firebase Breakage**
- If we double-fire analytics events, reports become wrong
- Mitigation: Only fire analytics on first read, not replays

❌ **Risk 5: Quiz Replay + XP Loop**
- If user retakes quiz, they shouldn't earn XP again
- Mitigation: Quiz already prevents via `answered[]` array, no changes needed

---

## 3. Safe Implementation Plan

### Phase 1: Extend Progress Type (Non-Breaking)

**File**: `src/lib/progress.ts`

**Change**: Add optional `replays` field to track replay count per card

```typescript
type Progress = {
  // ... existing fields ...
  replays?: Record<string, number[]>;  // state -> [indexes of replayed cards]
  replayCount?: Record<string, Record<number, number>>;  // state -> { cardIndex: replayCount }
};
```

**Why this is safe:**
- Optional field (backward compatible)
- Old Progress objects without this field still work
- Migration happens naturally on first use

---

### Phase 2: Modify `markCard()` Logic

**File**: `src/lib/progress.ts`

**Current Logic:**
```typescript
export function markCard(p: Progress, stateName: string, index: number): Progress {
  const read = p.cards?.[stateName] ?? [];
  if (read.includes(index)) return p;  // ← Don't award XP if already read
  
  const newCards = { ...p.cards, [stateName]: [...read, index] };
  return {
    ...p,
    xp: p.xp + XP_PER_CARD,
    cards: newCards,
  };
}
```

**New Logic (Replay-Aware):**
```typescript
export function markCard(p: Progress, stateName: string, index: number, isReplay?: boolean): Progress {
  const read = p.cards?.[stateName] ?? [];
  const isFirstRead = !read.includes(index);
  
  // Only award XP on first read
  if (!isFirstRead && !isReplay) {
    return p;  // Card already read, not a replay attempt → no change
  }
  
  if (isFirstRead) {
    // First time reading this card → award XP
    const newCards = { ...p.cards, [stateName]: [...read, index] };
    return {
      ...p,
      xp: p.xp + XP_PER_CARD,
      cards: newCards,
    };
  }
  
  if (!isFirstRead && isReplay) {
    // Replay attempt → track it but don't award XP
    const replays = p.replayCount ?? {};
    const stateReplays = replays[stateName] ?? {};
    const newReplays = {
      ...replays,
      [stateName]: {
        ...stateReplays,
        [index]: (stateReplays[index] ?? 0) + 1,
      },
    };
    return { ...p, replayCount: newReplays };
  }
  
  return p;
}
```

**Why this is safe:**
- `isReplay` parameter is optional (default `false`)
- Existing callers don't pass it, behavior unchanged
- First read always rewards XP (backward compatible)
- Replay tracking is optional field (non-breaking)

---

### Phase 3: Update UI to Allow Replays

**File**: `src/components/screens.tsx`

**Current LearningCardScreen Logic:**
```typescript
// Line ~1190
const handleNext = () => {
  updateProgress((p) => markCard(p, state.name, cardIndex));
  // Navigate to next card or quiz
};
```

**New Logic (Allow Replays):**
```typescript
const handleNext = () => {
  const isReplaying = progress.cards?.[state.name]?.includes(cardIndex);
  updateProgress((p) => markCard(p, state.name, cardIndex, isReplaying));
  // Navigate normally
};
```

**UI Addition (Show Replay Indicator):**
```typescript
{progress.cards?.[state.name]?.includes(cardIndex) && (
  <Text className="text-xs text-amber-600">
    📖 Replaying this card (no XP)
  </Text>
)}
```

**Why this is safe:**
- Only shows indicator if card already read
- Navigation flow unchanged
- No new buttons, just clearer UX

---

### Phase 4: Update Navigation to Allow Card Rewinding

**File**: `src/components/screens.tsx`

**Current LearningHubScreen (line ~920):**
```typescript
const cards = [...].map((c, i) => ({
  ...c,
  done: read.includes(i) || completedCards >= CARDS_PER_STATE,
  active: i === completedCards && status !== "locked",  // ← Only next card highlighted
  locked: status === "locked",
  onOpen: () => onCard?.(i),
}));
```

**Change (Minor UI Update):**
```typescript
const cards = [...].map((c, i) => ({
  ...c,
  done: read.includes(i) || completedCards >= CARDS_PER_STATE,
  active: i === completedCards && status !== "locked",
  locked: status === "locked",
  onOpen: () => onCard?.(i),  // ← Already allows all cards (no change needed!)
  // Add subtle visual for completed cards:
  badge: read.includes(i) ? "✓ Done - Tap to replay" : null,
}));
```

**Why this is safe:**
- Navigation already allows clicking any unlocked card
- We're just adding a helpful badge/label
- No breaking changes to existing flow

---

## 4. Edge Cases Handled

| Edge Case | Solution | Risk Level |
|-----------|----------|-----------|
| **App restarts** | Replay count persisted in localStorage | LOW |
| **User offline** | Replay tracking works offline, syncs on online | LOW |
| **Process death** | Progress saved to localStorage before exit | LOW |
| **User retakes quiz** | Quiz `answered[]` already prevents double XP | LOW |
| **Old Progress version** | `replayCount` is optional field, auto-added on first use | LOW |
| **Accidental double-tap** | Same replay counted twice (acceptable, user can see replay count) | LOW |
| **Analytics events** | Only fire on first read via `!isFirstRead` check | MEDIUM |
| **Multi-device sync** | Replays tracked locally only (if sync added later, handle carefully) | MEDIUM |

---

## 5. Rollback Strategy

**If we need to revert:**

1. **Remove UI indicator** (lines in LearningCardScreen)
   - Feature silently becomes "no visible replay support"
   - XP protection still works
   
2. **Disable Replay Navigation** (in LearningHubScreen)
   - Re-add lock on completed cards: `locked: read.includes(i) || status === "locked"`
   
3. **Remove replayCount Field** (in Progress type)
   - Optional field, safe to ignore
   - Old data persists, new data isn't collected

4. **No database migration needed** — everything is localStorage-based

---

## 6. Implementation Steps (In Order)

### Step 1: Extend Progress Type ✅
- Add optional `replayCount?: Record<string, Record<number, number>>` to type
- File: `src/lib/progress.ts` (lines ~20-30)
- Risk: **NONE** (optional field, backward compatible)

### Step 2: Modify markCard() Function ✅
- Update logic to accept `isReplay` parameter
- Add replay tracking if replaying
- File: `src/lib/progress.ts` (lines ~100-120)
- Risk: **LOW** (parameter optional, default behavior unchanged)

### Step 3: Update LearningCardScreen ✅
- Detect if card is replay
- Pass `isReplay` to `markCard()`
- Add visual indicator "📖 Replaying - no XP"
- File: `src/components/screens.tsx` (lines ~1190-1200)
- Risk: **LOW** (UI-only, no logic changes)

### Step 4: Test on Device ✅
- Replay a card → should NOT earn XP
- Replay count should increase
- Progress should persist on app restart
- Navigate backward should work smoothly
- File: Device testing
- Risk: **NONE** (validation only)

---

## 7. Code Changes (Minimal & Safe)

### File 1: `src/lib/progress.ts`

**Add to Progress type:**
```typescript
type Progress = {
  // ... existing ...
  replayCount?: Record<string, Record<number, number>>;
};
```

**Update markCard function:**
```typescript
export function markCard(
  p: Progress,
  stateName: string,
  index: number,
  isReplay: boolean = false  // ← Add optional parameter
): Progress {
  const read = p.cards?.[stateName] ?? [];
  const isFirstRead = !read.includes(index);

  if (isFirstRead) {
    // Award XP on first read
    const newCards = { ...p.cards, [stateName]: [...read, index] };
    return {
      ...p,
      xp: p.xp + XP_PER_CARD,
      cards: newCards,
    };
  }

  if (isReplay) {
    // Track replay (no XP awarded)
    const replays = p.replayCount ?? {};
    const stateReplays = replays[stateName] ?? {};
    return {
      ...p,
      replayCount: {
        ...replays,
        [stateName]: {
          ...stateReplays,
          [index]: (stateReplays[index] ?? 0) + 1,
        },
      },
    };
  }

  return p; // Card already read, not a replay → no change
}
```

### File 2: `src/components/screens.tsx`

**Update LearningCardScreen handleNext (line ~1190):**
```typescript
const handleNext = () => {
  const isReplaying = progress.cards?.[state.name]?.includes(cardIndex);
  updateProgress((p) => markCard(p, state.name, cardIndex, isReplaying));
  // Navigate to next card or quiz...
};
```

**Add UI indicator (line ~1250):**
```typescript
{progress.cards?.[state.name]?.includes(cardIndex) && (
  <Text className="text-xs text-amber-600 font-medium">
    📖 Replaying • No XP earned this time
  </Text>
)}
```

---

## 8. Validation Checklist

### Functional Tests ✅
- [ ] Read card 1 → earn 25 XP
- [ ] Replay card 1 → XP remains same (no increase)
- [ ] Replay indicator shows when replaying
- [ ] Navigate back to previous cards works smoothly
- [ ] Quiz flow unchanged (still prevents double XP)
- [ ] State completion still works normally

### Regression Tests ✅
- [ ] First-time card read still awards 25 XP
- [ ] New users get XP normally
- [ ] Progress persists on app restart
- [ ] Navigation between cards smooth
- [ ] No UI glitches or overlapping text

### Production Safety ✅
- [ ] No crashes on replay
- [ ] No localStorage corruption
- [ ] Backward compatible with old Progress data
- [ ] No Firebase analytics duplication

### Edge Cases ✅
- [ ] Offline replay → tracked when online
- [ ] Process death during replay → handled gracefully
- [ ] Old app version + new code → works smoothly
- [ ] Rapid taps don't cause issues → handled

---

## 9. Production Risk Verdict

### Risk Level: **MEDIUM → LOW** (with plan)

**Why MEDIUM initially:**
- Modifying XP award logic (core feature)
- Changes to Progress type (persistent data)
- Could break analytics if not careful

**Mitigations reduce to LOW:**
- ✅ Optional field (backward compatible)
- ✅ Parameter is optional (existing code unchanged)
- ✅ Explicit replay check prevents double XP
- ✅ UI-only changes (no core logic)
- ✅ Easy rollback (just remove `isReplay` parameter)

**Final Verdict: SAFE TO IMPLEMENT** ✅

---

## 10. Alternative Approaches (Rejected)

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Plan A (Above)** | Minimal changes, backward compatible, clear | Requires new field | ✅ **CHOSEN** |
| **Plan B: Replay Bonus XP** | Could give small XP on replays | Complexity, encourages grinding | ❌ Rejected |
| **Plan C: Separate Replay Mode** | Explicit opt-in | Breaking change, UX confusion | ❌ Rejected |
| **Plan D: Remove XP System** | Simple, no tracking needed | User frustration, lose engagement | ❌ Rejected |
| **Plan E: Timelock Replays** | Prevent abuse (replay only 1x per day) | Unnecessary complexity | ❌ Rejected |

---

## Summary

**What we're building:**
- Allow users to replay cards to reinforce learning
- Prevent double-XP earning on replays
- Track replay count for future analytics
- Minimal code changes, maximum safety

**Why it's safe:**
- Optional field (backward compatible)
- Default behavior unchanged
- Easy rollback
- No breaking changes

**Time to implement:** ~30 minutes  
**Lines of code changed:** ~20 lines  
**Files affected:** 2  
**Risk level:** LOW  

**Status: READY TO IMPLEMENT** 🚀
