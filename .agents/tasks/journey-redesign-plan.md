# Journey Screen Redesign — Implementation Plan

**Status**: Ready for implementation  
**Scope**: Visual + UX polish only (no logic changes)  
**Single Source of Truth**: `p.completed` is the authoritative progress marker  

---

## Key Findings

### Existing Architecture
- **Progress source**: `p.completed` (string array of state names) in `src/lib/progress.ts`
- **States data**: `INDIA_STATES` in `src/lib/states.ts`; 36 items (28 states + 8 UTs), alphabetically sorted by category
- **State names**: Abbreviated in some cases (e.g., "A. Pradesh", "H. Pradesh"); full names stored in `state.name`
- **Regions**: Defined in `src/lib/passport-helpers.ts` as `REGIONS` object with 6 regions + 1 UT region
- **Milestone logic**: Already exists in `IndiaProgressMap.tsx` using count thresholds [5, 10, 15, 20, 25, 30, 36]
- **Current header**: Uses percentage-based milestone messaging, needs replacement with count-based approach
- **State status**: Already implemented as "done" | "current" | "available" (via `statesWithProgress`)
- **BottomNav**: Located in `screens.tsx` line ~207; labels are: Home, Journey, Explorer, Badges, Me
- **Bottom padding**: States grid may be hidden behind navigation; needs explicit bottom padding

### No Breaking Changes Needed
- All existing state logic works; only UI text and styling change
- `statesWithProgress(p)` already marks states as available/current/done correctly
- No new progress tracking system needed
- Region collapse/expand already has `expandedRegion` state variable (defined but not wired)

---

## Implementation Plan

### 1. Create Motivational Message Function
**What**: Add `getJourneyMotivationalMessage(completed: number)` helper function that returns both line 1 and line 2 text based on count milestones.

**File**: `src/lib/journey-messaging.ts` (new file)

**Details**:
```typescript
export function getJourneyMotivationalMessage(completed: number): { line1: string; line2: string } {
  const MILESTONES = [5, 10, 15, 20, 25, 30, 36];
  
  if (completed === 0) {
    return { line1: "🚀 Start exploring!", line2: "🌱 Next milestone: 5 states" };
  } else if (completed === 36) {
    return { line1: "👑 India Master!", line2: "🎉 You explored all 36 destinations!" };
  } else if (completed === 35) {
    return { line1: "🏆 Almost there!", line2: "👑 1 more state to become India Master!" };
  } else if (completed >= 30) {
    return { line1: "🏆 Almost there!", line2: "👑 Next milestone: 36 states" };
  } else if (completed === 27 || completed === 28 || completed === 29) {
    return { line1: "🏆 Almost there!", line2: "👑 Next milestone: 30 states" };
  } else if (completed >= 25) {
    return { line1: "🌳 Halfway there!", line2: "🏆 Next milestone: 30 states" };
  } else if (completed === 20 || completed === 21 || completed === 22 || completed === 23 || completed === 24) {
    return { line1: "🌳 Halfway there!", line2: "🏆 Next milestone: 25 states" };
  } else if (completed >= 15) {
    return { line1: "🌿 Great start! Keep going!", line2: "🏆 Next milestone: 20 states" };
  } else if (completed >= 10) {
    return { line1: "🌿 Great start! Keep going!", line2: "🌿 Next milestone: 15 states" };
  } else if (completed >= 5) {
    return { line1: "🌱 Great start! Keep going!", line2: "🌿 Next milestone: 10 states" };
  } else {
    return { line1: "🌱 Start exploring!", line2: "🌱 Next milestone: 5 states" };
  }
}
```

**Verify**: `npx vitest run src/lib` — function exports correctly and returns correct messages for all thresholds (0, 1-4, 5, 6-9, 10, 11-14, 15, 16-19, 20, 21-24, 25, 26-29, 30, 31-34, 35, 36).

---

### 2. Update Top Header — Progress Section
**What**: Replace percentage-based milestone text with count-based motivational messages using the new helper.

**File**: `src/components/screens.tsx` lines ~1380–1395

**Current code**:
```jsx
{completedStates < 9 && `🎯 25% milestone: ${Math.max(0, 9 - completedStates)} more states`}
{completedStates >= 9 && completedStates < 18 && `🌎 50% milestone: ${Math.max(0, 18 - completedStates)} more states`}
{completedStates >= 18 && completedStates < 27 && `🏁 75% milestone: ${Math.max(0, 27 - completedStates)} more states`}
{completedStates >= 27 && `👑 Explore the final states to become India Master!`}
```

**New code**:
```jsx
import { getJourneyMotivationalMessage } from "@/lib/journey-messaging";

// At component top, after other hooks:
const motivational = getJourneyMotivationalMessage(completedStates);

// In JSX, replace the milestone text with:
<div className="text-xs font-bold text-white/80 mt-2">
  <div>{motivational.line1}</div>
  <div>{motivational.line2}</div>
</div>
```

**Verify**: Run dev server, navigate to `/journey`, check that header shows correct messages for 0, 5, 10, 15, 20, 25, 30, 35, 36 states completed.

---

### 3. Replace State Short Names with Full Names
**What**: Change all state card labels from abbreviated form (e.g., "A. Pradesh") to full names (e.g., "Andhra Pradesh").

**File**: `src/components/screens.tsx` lines ~1704, ~1784

**Current code**:
```jsx
<div className="text-xs font-extrabold leading-tight">{state.short}</div>
```

**New code**:
```jsx
<div className="text-xs font-extrabold leading-tight">{state.name}</div>
```

**Also update**: `src/components/PassportSapling.tsx` line ~116 and `src/components/PassportMightyTree.tsx` line ~170 (same change).

**Verify**: `npm run build` succeeds; navigate to `/journey`, `/explorer`, and `/badges` screens and confirm full state names display without text overflow (may need to adjust card height or use 2-line text with `line-clamp-2`).

---

### 4. Fix Bottom Navigation Label (Optional)
**What**: If routing allows, rename "Explorer" tab to "Explore" for consistency.

**File**: `src/components/screens.tsx` line ~213

**Current code**:
```typescript
{ id: "explorer", icon: "🔍", label: "Explorer", to: "/explorer" },
```

**New code**:
```typescript
{ id: "explorer", icon: "🔍", label: "Explore", to: "/explorer" },
```

**Risk**: Routing to `/explorer` must remain the same. Label change is UI only.

**Verify**: `npm run build` and test navigation — verify that clicking "Explore" still navigates to `/explorer` (route handler).

---

### 5. Add Bottom Padding to Journey Scroll Container
**What**: Ensure the final state card and Union Territories section can scroll completely above the bottom navigation without being hidden.

**File**: `src/components/screens.tsx` line ~1561 (the scroll container div)

**Current code**:
```jsx
<div className="relative flex-1 mx-3 mt-2 rounded-[28px] overflow-y-auto overflow-x-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
  {/* Regional sections ... */}
  <div className="relative w-full px-4 space-y-6 py-6">
```

**New code**:
```jsx
<div className="relative flex-1 mx-3 mt-2 rounded-[28px] overflow-y-auto overflow-x-hidden animate-fade-in" style={{ animationDelay: "200ms" }}>
  {/* Regional sections ... */}
  <div className="relative w-full px-4 space-y-6 py-6 pb-24">
```

**Why**: `pb-24` (6rem / 96px) provides clearance for the fixed bottom nav (which is ~60px) plus safe area padding.

**Verify**: Run dev server on mobile viewport (~375px width), scroll to bottom of Journey screen, confirm Union Territories section and final state cards are fully visible above the bottom nav with no overlap.

---

### 6. Display Full State Names in Regional Progress
**What**: State cards in grid should show full state name on one or two lines. Adjust card height if needed to fit text.

**File**: `src/components/screens.tsx` lines ~1703–1704 (state card rendering)

**Current approach**: `state.short` is used, which abbreviates names.

**New approach**: Use `state.name` instead. For long names (e.g., "Dadra & Nagar Haveli and Daman & Diu"), the card will wrap to 2 lines if needed.

**CSS adjustment** (if text overflows):
- Increase card padding slightly or reduce image size
- Use `line-clamp-2` on the text div to prevent overflow
- Adjust grid gap if necessary using existing `gap-[--gap-base]` token

**Verify**: Visual inspection on `/journey` — all state names display clearly, cards remain aligned in grid, no text cutoff.

---

### 7. Ensure Region Progress Uses Shared State Source
**What**: Confirm that region progress calculations use the same `p.completed` source.

**File**: `src/components/screens.tsx` lines ~1660–1682 (region header rendering)

**Current logic**:
```typescript
const regionDone = regionStates.filter((s) => s.status === "done").length;
```

**Status quo**: This is correct — `s.status === "done"` is set by `statesWithProgress(p)` which uses `p.completed.includes(s.name)`. No change needed.

**Verify**: Confirm that region progress percentages always match the individual state statuses by checking `/journey` at 5, 10, 15, 20 completed states.

---

### 8. Wire Expand/Collapse (Deferred)
**What**: The `expandedRegion` state variable exists but is not wired to region headers. If collapse/expand is desired, it can be added after this redesign.

**Current status**: Not implemented. Chevron icons would be interactive if this were enabled.

**Verify**: This is a deferred feature. Plan does not include it. Future task only.

---

## Terminology & Style Guide

Use throughout the redesign:
- **"states & UTs explored"** instead of "places explored"
- **Full state names**: Andhra Pradesh (not A. Pradesh), Himachal Pradesh (not H. Pradesh), Uttar Pradesh (not U. Pradesh), Madhya Pradesh (not M. Pradesh), West Bengal (not W. Bengal), Jammu & Kashmir (not J & K), Dadra & Nagar Haveli and Daman & Diu (not DNH & DD)
- **Spacing**: Use existing tokens: `--padding-base` (16px), `--gap-base` (12px)
- **Colors & gradients**: Reuse existing region gradients from `REGIONS` object
- **Icons**: Use existing emojis from state data

---

## Testing Checklist

- [ ] Header motivational messages update correctly at all count thresholds
- [ ] Full state names display without overflow on all state cards
- [ ] Bottom nav does not overlap content; scroll to bottom shows entire Union Territories section
- [ ] Region progress bars update as states are marked complete
- [ ] "Explorer" → "Explore" label change (if implemented) does not break routing
- [ ] Build completes without errors: `npm run build`
- [ ] Milestone celebration popups still trigger at 25%, 50%, 75%, 100% (legacy feature, no change)

---

## Notes

- **No changes to progression logic**: `p.completed` remains the single source of truth
- **No new state management**: `expandedRegion` exists but is not wired in this redesign
- **Non-breaking**: All changes are UI/styling only
- **Educational focus**: Using full state names reinforces learning goal
- **Accessibility**: Full names are more readable for children; existing ARIA labels remain
