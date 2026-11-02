# Learning Hub UI Redesign - Technical Design Document

**Status:** Design Review Ready  
**Target:** Match reference screenshot exactly  
**Scope:** `LearningHubScreen` and supporting components in `src/components/screens.tsx`  

---

## Current Implementation Analysis

### Existing LearningHubScreen Structure

The `LearningHubScreen` component (lines 1840–2150 in `src/components/screens.tsx`) currently renders:

1. **Header Section** (h-32, 128px):
   - Full-width background image (`stateHeaderBg`)
   - Back button (left): white circle with `‹` symbol
   - State name (center): `text-h2 font-extrabold text-text-on-header`
   - Star/XP counter (right): white pill with star emoji and XP calculation

2. **Scrollable Content Area**:
   - Progress card (overlapping header via `-mt-6`): white surface with "Your state adventure" label, progress count, and progress bar
   - Section heading: "Explore the state" + subtitle
   - 2-column challenge card grid (6 cards): `grid-cols-2 gap-3`
   - Quiz panel: full-width button with lock/unlock states

3. **HubCard Component** (lines 2160–2260):
   - Custom border styling: neutral gray border by default, orange border for Capital (index 0)
   - Number badge (top-left): 2-digit numbered badge
   - Icon (center): emoji
   - Checkmark (top-right): green circle for completed cards
   - Title and subtitle (middle)
   - Question count and navigation arrow (bottom)

### Existing Theme System

**Theme Files Location:** `src/styles/themes/` (individual theme CSS files)

**Theme Token Architecture:**
- Base tokens: `src/styles/base-tokens.css` (typography, spacing, z-index, shadows, border-radius)
- Color tokens: `src/styles/tokens.css` (root fallbacks) + individual theme overrides
- CSS Variables Model: All colors, shadows, and surfaces use `var(--*)` custom properties
- Theme Application: `src/store/themeStore.ts` sets `data-theme` attribute on `<html>` element

**Active Design Tokens in Use:**
- Surfaces: `--surface-card`, `--surface-raised`, `--surface-sunken`, `--surface-muted`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-header`, `--text-on-primary`
- Actions: `--action-primary-bg`, `--action-secondary-bg`, `--action-success-bg`
- Accents: `--accent-1` through `--accent-6` (with `-soft` and `-ink` variants)
- Feedback: `--fb-success-bg`, `--fb-success-fg`, `--fb-warning-*`, `--fb-error-*`, `--fb-info-*`
- Shadows: `--shadow-soft`, `--shadow-elevated-1`, `--shadow-raised`
- Border: `--border-color`, `--border-subtle`, `--border-width`
- Progress: `--progress-track`, `--progress-fill`, `--progress-fill-2`

**Tailwind Integration:** `tailwind.config.ts` extends default theme with semantic color mappings that reference CSS variables (e.g., `"surface-card": "var(--surface-card)"`)

### Existing Component Ecosystem

**Reusable Components:**
- Progress bar: Simple `<div>` with `h-2.5 bg-accent-5-soft rounded-full` + inner fill bar
- Badges: Circular elements with flexbox centering, shadow tokens
- Cards: White surfaces with `rounded-2xl`, `shadow-elevated-1` or `shadow-soft`
- Buttons: Flex layouts with `active:scale-95` transitions, cursor management
- Grid: Tailwind `grid-cols-2` with `gap-3`

**Styling Approach:**
- Inline `style={}` for dynamic colors (e.g., progress fill width)
- Tailwind utility classes for layout and spacing
- CSS variables for themeable values
- No separate CSS files per component; all styling co-located in JSX

### Data Flow & Progress Tracking

**Progress Hook:** `useProgress()` returns user's learning progress
**Card Completion Logic:**
- `cardsRead(progress, state.name)` returns array of completed category indices (0–5)
- `learningCardsFor(state.name, "en", ageBand)` returns all cards (main + enriched) per state
- `cardCounts` useMemo calculates total and read count per category
- `completedCategories` counts categories where all cards are read

**State Data Sources:**
- `getState(stateName)`: Returns state object with capital, language, food, monumentName, animal, animalName, funFact, emoji, etc.
- `state.monument`: Emoji for Places card
- `state.animal`: Emoji for State Animal card
- `EMOJI.utility.*`: Shared emoji constants for Capital, Language, Food, Fun Fact
- State-specific header artwork: `stateHeaderBg` (imported from assets)

### Current Responsive Layout

**Assumptions in Current Code:**
- Header: Fixed `h-32` (128px)
- Progress card: Negative top margin (`-mt-6`) to overlap header
- Grid: 2-column layout with 3px gap, wraps naturally
- Scrollable: Content area allows vertical scroll
- Pixel-based dimensions throughout

**Known Issues (from task requirements):**
- Layout may not respect Android insets for status bar and navigation bar
- Fixed heights may cause overflow issues on smaller viewports
- Progress panel overlap positioning may need refinement
- Cards may not handle long descriptions gracefully

---

## Reference Design Requirements

From the provided screenshot, the Learning Hub should display:

### 1. Header Section
- Landscape background image covering full width/height
- Back button: white circular surface (10×10 size, or ~40px), positioned top-left with padding
- Breadcrumb navigation: "Journey > Southern Region > [state emoji]" (below or within header)
- State name: Prominent, bold typography, centered or positioned intentionally
- Trophy/streak indicator: Visual indicator for "Day 1 streak" or similar
- Star/XP counter: White pill-shaped background, right-aligned, with "⭐ 0" or actual XP value

### 2. Progress Panel (Overlapping Header)
- Positioned to overlap lower edge of header
- White rounded surface with soft shadow
- Left-aligned label: "Your state adventure"
- Right-aligned count: "0 / 6" or actual completion count
- Horizontal progress bar: themed color fill based on completion percentage
- Large border radius, consistent with card design system

### 3. Section Heading
- "Explore the state" as primary text
- "Complete all 6 challenges to unlock your quiz." as supporting subtitle
- Font sizes and spacing match reference exactly

### 4. Challenge Cards Grid
- 2-column layout, equal-width columns
- 6 cards total: Capital, Language, Famous Food, Places, State Animal, Fun Fact
- **Each card must contain:**
  - Colored number badge (top-left): "01", "02", etc. in 2-digit format
  - Category illustration/emoji (center)
  - Title (bold, wrapped if necessary)
  - Description/subtitle (multi-line wrapped, no overflow)
  - Question/card count (bottom-left): "X/Y" format
  - Navigation arrow in colored circle (bottom-right) for incomplete cards
  - Checkmark badge (top-right) for completed cards
  - Optional: State-specific border or accent color per card type

### 5. State Quiz Panel
- Below 6 cards in document flow, not overlaid
- Lavender/purple rounded surface
- Lock illustration/emoji (left side): 🔒 when locked, 🔓 when unlocked
- "State Quiz Locked" heading with supporting text when incomplete
- "State Quiz" heading with "Test your knowledge" when complete
- Decorative sparkle illustrations (right side): ✨ emoji
- Disabled appearance when all 6 challenges not completed
- Enabled/clickable when all 6 challenges complete

---

## Component Reuse Plan

### ✅ Reusable (Keep As-Is)
1. **Progress bar styling**: Current implementation uses theme tokens correctly
2. **Grid layout**: `grid grid-cols-2 gap-3` pattern works for 2-column responsive design
3. **Shadow tokens**: `shadow-soft`, `shadow-elevated-1` already match card styling
4. **Typography classes**: `text-h2`, `text-label`, `text-body` are semantic and theme-aware
5. **Color tokens**: All accent and text colors via CSS variables
6. **Circular button/badge styling**: Flexbox centering pattern + `rounded-full`
7. **Overflow handling**: `line-clamp-2` for text wrapping already in HubCard

### 🔄 Modify (Adjust Existing)
1. **HubCard component**:
   - Keep structure but refine spacing/dimensions to match reference exactly
   - Ensure borders use consistent token system (not inline `style` for borders)
   - Verify card heights auto-size based on content (no fixed heights)

2. **Progress card**:
   - Verify `px-5 -mt-6 relative z-20` positioning overlaps correctly on all screen sizes
   - Confirm padding and typography match reference

3. **Header section**:
   - Back button: Verify circular shape, size, and shadow
   - Star counter pill: Verify shape, padding, and shadow
   - State name typography: Ensure `text-on-header` token exists and is correct

4. **Quiz panel**:
   - Change background: Use `bg-accent-5-soft` or a dedicated lavender token
   - Ensure lock/unlock icon is visible and correctly positioned
   - Verify disabled state visual treatment

### ❌ Not Needed (Skip)
- Separate CSS files for Learning Hub
- New component types beyond what exists
- Parallel design systems or custom styling layers

---

## New Components/Tokens Needed

### Missing or Insufficient Tokens

1. **`--text-on-header`** — Currently used in header, verify it maps to contrasting color for header backgrounds
   - Check: `src/styles/tokens.css` and each theme file
   - If missing: Add to all theme files as high-contrast text color suitable for landscape headers

2. **Lavender/Purple for Quiz Panel** — Currently using `accent-5-soft`
   - Verify `accent-5` and `accent-5-soft` render as lavender/purple across all themes
   - If not: May need to create a dedicated `--quiz-locked-bg` token in theme files

3. **Breadcrumb styling** — Not currently present in Learning Hub
   - **Decision:** Breadcrumb is mentioned in task requirements but NOT visible in current code
   - **Action:** Implement as text-only breadcrumb or skip if not required by reference screenshot
   - **Recommendation:** If shown in reference, add as: `Journey > [Region] > [State Icon]` above state name

### New Components to Create (if not already present)

1. **Breadcrumb Component** (if required):
   - Simple text string: "Journey > Southern Region > 🏴"
   - Position: Above or inside header
   - Styling: Small text size, secondary text color

2. **Streak Indicator** (if required):
   - Icon + text: "🏆 Day 1 streak" or similar
   - Position: Within header, likely right side or top-right
   - Styling: Small badge or inline text

**Current code uses:**
- Trophy emoji: `EMOJI.action.trophy` or similar (verify in `src/constants/emoji.ts`)
- Fire emoji for streak: `EMOJI.action.fire`

---

## File Change List

### Primary Changes

**`src/components/screens.tsx`** (Main Learning Hub Implementation)
- Modify `LearningHubScreen` function (lines 1840–2150)
- Modify `HubCard` component (lines 2160–2260)
- Add breadcrumb rendering if needed
- Add streak indicator rendering if needed
- Ensure all inline styles use CSS variables, not hex colors
- Verify responsive behavior on Android viewport sizes

### Secondary Changes

**`src/styles/tokens.css`** (Theme Contract — If New Tokens Required)
- Add `:root` fallback for any new tokens (e.g., `--text-on-header`, `--quiz-locked-bg`)
- Ensure all new tokens are documented

**`src/styles/base-tokens.css`** (Neutral Tokens — If New Spacing/Shadow Required)
- Add any new shadow definitions if `shadow-soft` or `shadow-elevated-1` are insufficient

**Theme Files** (e.g., `src/styles/themes/clay.css`, `src/styles/themes/pop.css`, etc.)
- Add theme-specific values for any new color tokens
- Ensure `--text-on-header` is defined for each theme with appropriate contrast
- Ensure `--quiz-locked-bg` or reuse of existing accent tokens

**Optional: `tailwind.config.ts`**
- No changes needed if all new tokens follow existing pattern of CSS variable references
- If new color utility classes needed, add to `extend.colors` section

### No Changes Required

- `src/lib/progress.ts` — Progress tracking logic is correct
- `src/lib/states.ts` — State data structure is complete
- `src/constants/emoji.ts` — All required emoji already defined
- `src/routes/state.$slug.learn.tsx` — Route setup is correct
- Component styling files outside Learning Hub

---

## Responsive Layout Strategy

### Viewport Breakpoints

The app targets Android primarily, with the following considerations:

**Standard Android Sizes:**
- Small phones: 360–375px width
- Medium phones: 375–412px width
- Large phones: 412–600px width
- Tablets: 600px+

### Header Responsiveness

1. **Fixed Height:** `h-32` (128px) is appropriate for phones; may adjust if reference shows different proportion
2. **Background Image:** Uses `object-cover`, ensures it scales without distortion
3. **Content Overlay:** Flexbox with `justify-between` and `px-5` padding works across sizes
4. **Text Centering:** State name uses `flex-1` to center dynamically; verify on extremely long state names (e.g., "Himachal Pradesh")

### Progress Panel Overlap

1. **Negative Margin:** `-mt-6` (24px overlap) should be maintained; adjust if reference shows different overlap
2. **Padding:** `px-5` matches header padding for visual alignment
3. **Z-Index:** `z-20` ensures it renders above header; verify in all themes

### Grid Layout

1. **2-Column Layout:** `grid grid-cols-2 gap-3` is semantically correct for 2-column equal-width grids
2. **Padding:** `px-4` and `mb-6` are consistent with header/progress padding; may need adjustment for very small viewports
3. **Card Sizing:** Cards use `flex flex-col h-full` to ensure equal heights per row; content inside uses `line-clamp-2` to prevent overflow

**Responsive Behavior:**
- Grid naturally reflows for narrower viewports (no media queries needed)
- Card content is wrappable; long descriptions are clamped to 2 lines
- No horizontal scrolling due to `px-4` and `gap-3` constraints

### Android Insets & Safe Area

**Current Implementation:**
- No explicit `env(safe-area-inset-*)` CSS handling
- Header directly touches edge without inset consideration

**Recommendation:**
- Verify header respects status bar on Android
- Progress panel and cards respect bottom navigation bar space
- Overflow handling: `overflow-y-auto` allows vertical scroll; ensure no content is hidden

**Testing Plan:**
- Capture viewport at 375px × 667px (iPhone SE equivalent)
- Capture viewport at 412px × 823px (Android standard)
- Verify status bar and navigation bar do not overlap content
- Verify all 6 cards and quiz panel are fully scrollable

---

## Testing Plan

### Unit Testing
- No new unit tests required; existing progress logic is correct
- Verify card count calculations via console logs in existing `cardCounts` useMemo

### Visual Regression Testing

1. **Reference Comparison:**
   - Capture current state of Learning Hub on test device
   - Overlay with provided reference screenshot
   - Compare: header proportions, progress panel overlap, card dimensions, card typography, spacing

2. **Responsive Testing (Android Sizes):**
   - Test at 360px, 375px, 412px, 600px widths
   - Verify grid layout reflow (no horizontal scroll)
   - Verify card content wrapping (no clipped text)
   - Verify header back button and star counter accessibility

3. **Content Variation Testing:**
   - Long state names (e.g., "Himachal Pradesh" vs. "Goa")
   - Long Fun Fact descriptions (multi-line text)
   - Completed vs. incomplete challenge states
   - Quiz locked vs. unlocked states

4. **Theme Testing:**
   - Render Learning Hub in at least 3 themes: clay (light), pop (bright), oled (dark)
   - Verify all token colors render correctly
   - Verify text contrast meets WCAG AA standards
   - Verify shadow effects are visible and appropriate

### Manual Testing Checklist

- [ ] Header background image displays correctly
- [ ] Back button is clickable and functional
- [ ] Star/XP counter displays correct value
- [ ] Progress panel overlaps header as intended
- [ ] Progress bar width reflects completion percentage
- [ ] 6 challenge cards display in 2-column grid
- [ ] Card 1 (Capital) has orange border per specification
- [ ] Cards display number badge, icon, title, description, count, arrow/checkmark correctly
- [ ] Quiz panel displays with lock icon when incomplete
- [ ] Quiz panel displays with unlock icon when all challenges complete
- [ ] All content scrolls vertically without horizontal overflow
- [ ] Bottom navigation bar does not cover quiz panel
- [ ] Completed cards show checkmark, not number badge
- [ ] Completed cards' question count is styled differently (green for success)
- [ ] Long descriptions wrap without overflow
- [ ] Typography sizes and weights match reference
- [ ] All spacing and padding matches reference

### Build & Lint

- [ ] `npm run type-check` passes (TypeScript)
- [ ] `npm run lint` passes (ESLint)
- [ ] No console warnings or errors in dev tools
- [ ] `npm run build` succeeds (production build)
- [ ] No bundle size regression

---

## Edge Cases & Considerations

### Content Length

1. **Long State Names:** Some states like "Himachal Pradesh" or "Uttarakhand" are longer than others
   - Text centering in header should handle multi-line if needed (rare)
   - Consider `text-nowrap` or `line-clamp-1` if state name wrapping is undesirable

2. **Long Fun Fact Descriptions:** May exceed 2-line clamp
   - `line-clamp-2` enforces visual limit; text is not hidden, just visually truncated
   - Full text is available on card click

3. **Variable Question Counts:** Each category has different number of cards
   - Card count is dynamic from `learningCardsFor()`; layout must accommodate variation
   - Grid handles variable-height cards via `flex flex-col h-full`

### State Transitions

1. **Locked State:** When state status is "locked"
   - All cards show as disabled/locked
   - Quiz panel is disabled
   - User cannot click on any card

2. **Replay Mode:** `allowReplay={true}` parameter
   - Treats locked states as "current" for playability
   - Should not affect visual presentation of cards

3. **Quiz Unlock Animation:** `showUnlockAnimation` triggers `animate-quiz-unlock-bounce`
   - Animation fires once when all 6 categories are completed
   - Defined inline in component's `<style>` tag

### Accessibility

1. **Keyboard Navigation:**
   - All buttons have `aria-label` for screen readers
   - Tab order: back button → cards (left to right, top to bottom) → quiz panel

2. **Color Contrast:**
   - Back button text on white surface
   - State name on landscape background image (may have low contrast)
   - Quiz lock/unlock icon on colored background
   - Verify all text meets WCAG AA (4.5:1 for normal text)

3. **Focus States:**
   - All buttons/cards should show focus ring on keyboard focus
   - Existing `:focus-visible` patterns in tailwind should apply

### Potential Issues to Watch

1. **Header Image Sizing:** If image is too small or wrong aspect ratio, `object-cover` may not display correctly
2. **Progress Bar Animation:** `transition-all duration-300` assumes smooth progress updates; verify with rapid state changes
3. **Z-Index Stacking:** `-mt-6 relative z-20` positioning may conflict with modals or other overlays
4. **Safe Area on Notched Devices:** Android devices with notches may need explicit inset padding
5. **Performance:** 6 cards + quiz panel rendering; memoization via useMemo should prevent unnecessary re-renders

---

## Design Decisions & Rationale

### 1. **Grid Column Layout**
**Decision:** Maintain 2-column `grid-cols-2` layout with `gap-3`

**Reasoning:**
- Matches reference screenshot
- Responsive without media queries for typical phone sizes
- Equal-width columns provide visual balance
- 6 cards fit naturally (2 rows × 3 cards)

**Alternative Considered:** Single-column layout
- Rejected: Reference clearly shows 2-column

### 2. **CSS Variables vs. Inline Styles**
**Decision:** Use CSS variables (`var(--*)`) for all colors, shadows, border-radius

**Reasoning:**
- Ensures theme consistency across all themes
- Prevents hardcoded hex values which violate design system
- Allows global theme changes without component modifications

**Alternative Considered:** Hardcoded hex colors
- Rejected: Violates requirement to use existing theme system

### 3. **Card Height Auto-Sizing**
**Decision:** Use `flex flex-col h-full` to ensure equal heights per row

**Reasoning:**
- Cards in same row are visually aligned
- Content inside cards wraps naturally (`line-clamp-2` on subtitle)
- No fixed pixel heights; responsive to content

**Alternative Considered:** Fixed heights
- Rejected: Inflexible for varying content lengths

### 4. **Progress Panel Overlap via Negative Margin**
**Decision:** Use `-mt-6` negative top margin to overlap header

**Reasoning:**
- Standard Tailwind pattern for overlapping elements
- Maintains document flow (not absolute positioning)
- Responsive; margin adjusts with container size
- Z-index handles stacking order

**Alternative Considered:** Absolute positioning
- Rejected: Would require fixed positioning logic; less responsive

### 5. **Quiz Panel as Full-Width Button**
**Decision:** Implement as a single `<button>` element with flexbox layout

**Reasoning:**
- Semantically correct (single clickable action)
- Simplified structure vs. multiple nested elements
- Consistent styling with other buttons in app
- Easy to manage disabled state

**Alternative Considered:** Card + separate button
- Rejected: Quiz panel is a single, cohesive action; treating as button is clearer

---

## Technology Stack (Locked)

- **React 18+** with TypeScript
- **Tailwind CSS** 3.x for utility-first styling
- **CSS Custom Properties (CSS Variables)** for theme tokens
- **Zustand** for state management (progress, theme)
- **React Router** v7 for navigation
- **Flexbox & CSS Grid** for layouts

---

## Notes for Implementer

1. **Do not introduce new color schemes.** Use existing tokens or add to base tokens if truly necessary.

2. **All responsive adjustments should use Tailwind utilities** (e.g., `sm:px-6`, `md:grid-cols-3`), not custom CSS.

3. **Test on actual Android device or emulator at 375px and 412px widths** to catch responsive issues early.

4. **Verify progress calculation logic** by inspecting browser console logs in `cardCounts` useMemo; existing logs are helpful for debugging.

5. **Animation: `animate-quiz-unlock-bounce`** is defined inline in component; ensure it renders correctly in all browsers and respects `prefers-reduced-motion`.

6. **Back button positioning:** Currently uses `flex-shrink-0` to prevent compression; verify it remains accessible and clickable on all screen sizes.

7. **Long state names:** Test with "Himachal Pradesh", "Arunachal Pradesh", "Tamil Nadu" to ensure header layout remains balanced.

8. **Scrolling behavior:** `flex-1 overflow-y-auto` on scrollable area should allow natural scrolling; test on Android with virtual keyboard visible.

---

## Summary

This design maintains the existing component architecture and theme system while ensuring visual fidelity to the reference screenshot. Changes are localized to the Learning Hub, with no modifications to unrelated screens or core systems. The layout is responsive across Android viewport sizes and respects the existing design token hierarchy. All colors, shadows, and typography use CSS variables for full theme support.
