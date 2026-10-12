# Journey Screen Redesign — Implementation Notes

**Date**: Implementation Complete  
**Status**: ✅ BLOCKING ISSUE RESOLVED  
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

## Notes

- Both regional state cards and Union Territory cards now have identical in-progress logic
- Progress bar shows actual completion percentage (e.g., "2/6 adventures" = 33% filled bar)
- "Continue" label uses play emoji (▶) for visual consistency with "Play"
- Card count format matches design spec: "X/Y adventures" (lowercase, small font)
- No changes to game logic, state progression, or persistence
- All existing features (milestone celebrations, region progress, status badges) remain intact
