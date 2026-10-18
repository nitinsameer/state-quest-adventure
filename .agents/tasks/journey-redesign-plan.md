# Journey Map Screen Redesign Plan

## Problem Statement
JourneyMapScreen currently uses hardcoded `gradient-saffron` (orange) for the header, making it non-responsive to theme changes. When users select different themes, the header remains orange while other screens (Home, Explorer) update correctly. Additionally, the overall layout and spacing lacks the premium polish seen in ExplorerScreen (PassportSeedling component).

## Target Outcome
JourneyMapScreen should:
1. Use theme-aware header styling matching Home screen's `bg-bg-header` token approach
2. Match Explorer's premium visual design (spacing, shadows, card styling)
3. Apply premium typography and layout patterns
4. Maintain all existing functionality (region tabs, card navigation, state display)

---

## Design Decisions

### 1. Header Styling Strategy
**Decision**: Replace `gradient-saffron` with `bg-bg-header` CSS token reference
**Rationale**: 
- Home screen uses `bg-bg-header` which is theme-aware and defined per theme in clay.css, aero.css, etc.
- This is the established pattern in the codebase for headers that respond to theme changes
- Maintains visual consistency across Home, Journey, and other screens
- No new class creation needed; uses existing design token system

### 2. Background Styling Strategy
**Decision**: Replace `gradient-sky` with `bg-bg-page` CSS token
**Rationale**:
- `gradient-sky` is hardcoded (light blue gradient)
- `bg-bg-page` is theme-aware and designed for page backgrounds
- Ensures Journey page respects theme color scheme
- Matches Home and Explorer page backgrounds

### 3. Premium Layout Improvements
**Decision**: Match Home screen header structure and spacing exactly
**Rationale**:
- Home header: `px-6 pt-4 pb-5 bg-bg-header rounded-b-[32px]`
- Journey header: currently `px-6 pt-3 pb-4 gradient-saffron rounded-b-3xl`
- Standardizing spacing ensures consistent visual hierarchy
- Rounded corners already match (32px vs 3xl = ~30px)

### 4. Card Styling (JourneyDestinationCard)
**Decision**: Cards already use tone-specific CSS tokens; no changes needed to card backgrounds
**Rationale**:
- Cards use `var(--accent-1-soft)`, `var(--accent-2-soft)` etc., which are theme-aware
- Status indicators (locked/completed) already use token references
- Buttons already use `ui-accent-1`, `ui-accent-3` classes which are theme-aware
- No additional changes needed for card theming

### 5. Region Tab Pills
**Decision**: Keep existing styling; already uses `ui-accent-1` and `ui-accent-1-soft` classes
**Rationale**:
- These classes are theme-aware and respond to CSS token changes
- Styling already matches Home and Explorer region tabs
- No changes required

### 6. Typography and Spacing
**Decision**: Maintain all existing typography but ensure premium feel through consistent spacing
**Rationale**:
- Journey text is already using semantic CSS variables (font-bold, font-extrabold, etc.)
- Spacing improvements come from header restructuring, not typography changes
- Card layout already has good premium spacing with padding variables

---

## Implementation Plan

### Phase 1: Update JourneyMapScreen Header
**What**: Replace hardcoded orange gradient header with theme-aware styling
**Files**: `src/components/screens.tsx`
**Changes**:
- Line ~1590: Change `gradient-saffron rounded-b-3xl` to `bg-bg-header rounded-b-[32px]`
- Change `pt-3 pb-4` to `pt-4 pb-5` for premium spacing consistency with Home
- Verify progress bar styling remains visible (white/translucent colors are still appropriate)
- Keep all other header elements unchanged (avatar, streak badge, progress info)

**Verify**: 
```bash
npm run build
npm run lint -- src/components/screens.tsx
```
- Build succeeds with no CSS errors
- Header displays with correct theme-aware background color
- No hardcoded colors flagged by `no-hardcoded-colors` ESLint rule

### Phase 2: Update Background Color
**What**: Replace `gradient-sky` with theme-aware page background
**Files**: `src/components/screens.tsx`
**Changes**:
- Line ~1543: Change `gradient-sky` to `bg-bg-page`
- This change makes the entire Journey page background theme-responsive

**Verify**:
```bash
npm run build
npm run lint -- src/components/screens.tsx
```
- Build succeeds
- Background color changes when theme is switched in ThemesScreen
- No ESLint color warnings

### Phase 3: Verify Card and Tab Styling
**What**: Confirm JourneyDestinationCard and region tabs are already theme-aware
**Files**: `src/components/JourneyDestinationCard.tsx` (review only, no changes)
**Verification Steps**:
- Open JourneyMapScreen in browser
- Switch themes in Profile → Themes
- Verify: header background changes, cards update accent colors, tabs are responsive
- All elements adapt to theme without manual color overwrites

**Verify**:
```bash
npm run build
npm run lint
```
- No linting errors related to hardcoded colors
- No new CSS warnings

### Phase 4: Cross-Theme Testing
**What**: Ensure redesigned header works across all themes
**Verification Steps**:
1. Start the app and navigate to Journey Map
2. Open Profile → Themes
3. Test each theme: Clay, Aero, Cartoon/Comic, Glassmorphism, Skeumorphism
4. For each theme verify:
   - Header background color is correct and distinct from Home/Explorer
   - Progress bar is visible and readable
   - Avatar and streak badge are visible
   - Region tabs are styled correctly
   - Cards display with appropriate accent colors
5. Navigate Home → Journey → Explorer → Home and verify no visual regressions
6. Check that Journey header matches Home header design language

**Verify**:
```bash
npm run build && npm start
```
- All themes render correctly without layout breaks
- No CSS warnings in console
- Visual consistency across screens

---

## Risk Assessment

### Low Risk
- Header color change: `gradient-saffron` → `bg-bg-header` is a direct CSS token swap with no logic changes
- Background color change: `gradient-sky` → `bg-bg-page` is a direct CSS token swap
- These are the same patterns used throughout the codebase

### Verified Not Broken
- Card component styling: Already uses CSS tokens throughout
- Region tabs: Already use `ui-accent-*` classes (theme-aware)
- All buttons and interactive elements: Already use token-based classes
- No emoji or hardcoded colors in changes

### What Will NOT Change
- Region tab functionality and behavior
- Card interaction patterns (onStart, onReplay callbacks)
- Progress calculation and display
- State navigation logic
- StateIntroScreen, LearningHubScreen entry points

---

## Compliance with ESLint Rules

### No-Hardcoded-Colors Rule
- ✅ Changes remove hardcoded gradients (oklch values in gradient-saffron)
- ✅ Replace with CSS var() tokens: `bg-bg-header` resolves to `var(--bg-header)`
- ✅ No new inline style objects with hardcoded colors added
- ✅ All changes use existing CSS utility classes

### No-Hardcoded-Emoji Rule
- ✅ Header already uses EMOJI constants (EMOJI.feedback.trophy for streak)
- ✅ No changes to emoji in this redesign
- ✅ JourneyDestinationCard already uses EMOJI constants (EMOJI.action.play, EMOJI.action.replay)

---

## Verification Checklist

- [ ] Header gradient class changed from `gradient-saffron` to `bg-bg-header`
- [ ] Header spacing updated to `pt-4 pb-5` (from `pt-3 pb-4`)
- [ ] Header border-radius is `rounded-b-[32px]`
- [ ] Page background changed from `gradient-sky` to `bg-bg-page`
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` finds no hardcoded-color or hardcoded-emoji violations
- [ ] Journey header visually matches Home header design
- [ ] Theme switching works correctly (header background changes per theme)
- [ ] All region tabs display correctly
- [ ] Cards render with correct accent colors
- [ ] Navigation (home → journey → explorer → home) works without visual regressions
- [ ] Progress bar and streak badge remain visible in all themes

---

## Files to Modify

1. **src/components/screens.tsx**
   - Line ~1543: Page background
   - Line ~1590: Header styling (sticky div with gradient-saffron)
   - Total changes: 2 CSS class updates
   - No logic changes

2. **No other files need modification**
   - JourneyDestinationCard already uses theme-aware tokens
   - Region tab styling already uses theme-aware classes
   - Region pill styling already uses ui-accent-* classes

---

## Before/After Code Snippets

### Change 1: Page Background
**Before**:
```tsx
<div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col">
```

**After**:
```tsx
<div className="h-full w-full bg-bg-page relative overflow-hidden flex flex-col">
```

### Change 2: Header Styling
**Before**:
```tsx
<div className="sticky top-0 z-40 px-6 pt-3 pb-4 gradient-saffron rounded-b-3xl relative overflow-hidden animate-fade-in shadow-elevated-2">
```

**After**:
```tsx
<div className="sticky top-0 z-40 px-6 pt-4 pb-5 bg-bg-header rounded-b-[32px] relative overflow-hidden animate-fade-in shadow-elevated-2">
```

---

## Testing Commands

```bash
# Run full build (catches Tailwind and type errors)
npm run build

# Run linter (checks ESLint rules including hardcoded-colors and hardcoded-emoji)
npm run lint

# Run specific file linting
npx eslint src/components/screens.tsx

# Start dev server for manual theme testing
npm start
```

---

## Summary

This plan makes JourneyMapScreen theme-responsive by replacing two hardcoded gradient classes with existing CSS token references. The changes are minimal (2 lines), follow established codebase patterns, and align Journey design with Home screen premium styling. No logic changes, no component refactoring, and no risk to existing functionality.
