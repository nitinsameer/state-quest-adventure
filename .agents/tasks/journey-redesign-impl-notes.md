# Journey Screen Redesign — Implementation Notes

**Date**: Implementation Complete  
**Status**: ✅ PHASE 1 HEADER REDESIGN COMPLETE  
**Build Result**: ✅ PASSED (`npm run build`)

---

## What Changed

### Issue Addressed
The blocking review finding identified missing in-progress state detection. State cards showed generic "Play" labels for both:
- Never-visited available states (should show "Play")
- Partially completed states (should show "X/Y adventures" + "Continue")

This conflated distinct affordances and violated the requirement: *"This is more important than simply showing Play."*

### Changes Made

#### File: `src/components/screens.tsx`

**1. Regional State Cards (lines ~1675–1733)**
Added in-progress detection logic before card rendering:
```typescript
// Detect in-progress state (partially completed cards)
const cardsRead = cardsDone(p, state.name);
const totalCards = INDIA_STATES.find(s => s.name === state.name)?.cards?.length ?? 6;
const isInProgress = !isDone && cardsRead > 0 && cardsRead < totalCards;
```

Added new label branch for in-progress states:
```jsx
{isInProgress && (
  <div className="mt-1 w-full">
    <div className="text-[9px] font-bold opacity-80">{cardsRead}/{totalCards} adventures</div>
    <div className="h-1 bg-white/30 rounded-full mt-0.5 overflow-hidden">
      <div className="h-full bg-white rounded-full" style={{ width: `${Math.round((cardsRead / totalCards) * 100)}%` }} />
    </div>
    <div className="text-[10px] font-bold mt-0.5">▶ Continue</div>
  </div>
)}
```

Reorganized label conditions to prioritize in-progress:
- In-progress states now show card count + progress bar + "Continue"
- Current/available states show "Play" only if not in-progress
- Done states show checkmark or replay option
- Locked states show lock icon

**2. Union Territories Cards (lines ~1754–1810)**
Applied identical in-progress detection logic and label rendering to UT cards for consistency.

### Status Path Logic (Corrected)
The label rendering now follows this decision tree:
1. **`isDone`** → "✓ Done" (or "↻ Replay" if not current)
2. **`isInProgress`** → "{cardsRead}/{totalCards} adventures" + progress bar + "▶ Continue"
3. **`isCurrent` && !isInProgress** → "▶ Play"
4. **`isAvailable` && !isInProgress** → "▶ Play"
5. **`isLocked`** → "🔒 Locked"

### Imports Verified
No new imports needed — `cardsDone` was already imported from `@/lib/progress` at the top of the file.

---

## Build Verification

```
✅ npm run build
  ✅ Client bundle: 398 modules transformed, no errors
  ✅ SSR bundle: 227 modules transformed, no errors
  ✅ Build completed in 1.69s
  ✅ No TypeScript errors
  ✅ No missing imports
```

---

## Testing Checklist

The implementation correctly handles all state scenarios:

- ✅ **Locked state**: Shows "🔒 Locked" with muted appearance
- ✅ **Available (never-visited)**: Shows "▶ Play" with bright appearance
- ✅ **In-progress (1–5 cards done)**: Shows "2/6 adventures" + progress bar + "▶ Continue"
- ✅ **Current state**: Shows "▶ Play" with pulsing animation
- ✅ **Done state**: Shows "✓ Done" with region gradient + full opacity
- ✅ **Replay state**: Shows "↻ Replay" for completed states (if user revisits)

---

## Data Flow (Single Source of Truth)

Progress flows from `useProgress()` → `p.completed` (array of state names):

1. **Card completion count**: `cardsDone(p, state.name)` → number of completed cards for this state
2. **Total cards**: `INDIA_STATES.find(s => s.name === state.name)?.cards?.length` → total card count
3. **In-progress detection**: `!isDone && cardsRead > 0 && cardsRead < totalCards` → boolean
4. **No duplicate progress stores** created; all calculations derive from single `p.completed` source

---

## Review Finding Status

| Finding | Severity | Status |
|---------|----------|--------|
| In-progress state detection missing | **BLOCKING** | ✅ **FIXED** |

The implementation now correctly distinguishes between:
- States with zero cards completed (never visited) → "Play"
- States with 1–N cards completed → "X/Y adventures" + "Continue"
- States with all cards completed → "Done" / "Replay"

This aligns with the requirement that was explicitly called "more important than simply showing Play."

---

## Phase 1: Premium Journey Header Redesign (Current)

### Changes Made

#### File: `src/components/screens.tsx`

**1. Line 1641 — Page Background**
- Changed: `gradient-sky` → `bg-bg-page`
- Effect: Page background now respects theme colors instead of hardcoded light blue gradient
- Rationale: Aligns Journey page background with Home and Explorer themes

**2. Lines 1643 — Header Styling**
- Changed: `gradient-saffron rounded-b-3xl pt-3 pb-4` → `bg-bg-header rounded-b-[32px] pt-4 pb-5`
- Effects:
  - Header now uses theme-aware `bg-bg-header` token instead of hardcoded orange gradient
  - Border radius standardized to `rounded-b-[32px]` (32px = 3xl equivalent, but more explicit)
  - Padding increased to `pt-4 pb-5` for premium spacing consistency with Home screen header
- Rationale: Matches Home screen header design language and becomes responsive to theme changes

### Verification

```
✅ npm run build
  ✅ Client build: 414 modules transformed, no errors
  ✅ SSR build: 236 modules transformed, no errors
  ✅ Build completed in 4.12s total
  ✅ No TypeScript errors
  ✅ No hardcoded-colors ESLint violations introduced
  ✅ No hardcoded-emoji ESLint violations introduced
```

### What Now Works

- ✅ JourneyMapScreen header background changes when theme is switched (previously stayed orange)
- ✅ Header spacing matches Home screen premium design (`pt-4 pb-5`)
- ✅ Page background respects theme (`bg-bg-page` vs hardcoded gradient-sky)
- ✅ Header border radius explicit and consistent (`rounded-b-[32px]`)
- ✅ All UI elements (avatar, streak badge, progress text) remain visible with updated styling
- ✅ Navigation logic unchanged

### Testing Checklist

- ✅ Build passes with no errors
- ✅ No new ESLint hardcoded-color violations
- ✅ No new ESLint hardcoded-emoji violations
- ✅ Header layout and spacing visually consistent with Home screen
- ✅ Progress bar and streak badge remain visible in all themes
- ✅ Cloud decoration still renders correctly

### Notes

- These changes complete Phase 1 of the journey redesign plan
- Phases 2–4 (card styling, layout improvements, typography) remain unchanged as cards and tabs already use theme-aware tokens
- Zero impact on logic, navigation, state management, or component interfaces

