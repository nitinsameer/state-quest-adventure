# Journey Screen UI Refinements — Match Reference Design

The Journey screen UI has been refined to precisely match the intended polished design. The implementation reuses the state header background image from the Learning screen, implements a compact vertical journey path with properly connected timeline nodes, and refines destination cards with correct styling and lock icons.

**Watch for:** Lock icon correctly uses 🔒 (not fire emoji), illustrations are sized appropriately (w-16 current, w-12 completed), and header background image renders without stretching. Backend destination data and state management are completely untouched.

**Verdict**: APPROVED

---

## High-level view

The header now reuses the existing `stateHeaderBg` asset from the Learning screen, layered behind a compact overlay containing the back button, "India Journey" title, and XP counter. The visual hierarchy remains intact with full readability across themes.

Progress tracking is consolidated into a single compact section showing the subtitle, X/36 counter, and a slim progress bar at the desired height (h-1.5, approximately 6px).

The destination journey path is now a vertical timeline with a connected line (gradient from completed green → current purple → locked grey) and individual nodes. Each destination maps to a card whose styling, spacing, and icon alignment match the reference exactly: purple border and background for the current destination, green styling for completed destinations, muted grey for locked destinations, and no illustrations or unnecessary space for locked rows.

Current and completed destinations display illustrations (16×16px and 12×12px respectively), centered and sized compactly. Locked destinations show only the destination name and a lock icon (🔒) aligned right, with no illustration or decorative content.

The Play button is prominent only on the current destination card, styled with the accent-5 purple color, and positioned with proper spacing (mt-3). All theme tokens are used correctly, and scrolling respects the bottom navigation inset.

---

<details>
<summary>Issues (0)</summary>

No blocking concerns identified. All requirements verified.

</details>

<details>
<summary>Details</summary>

### Header Background Image — Reuse from Learning Screen

The header now uses `stateHeaderBg` (imported from `@/assets/state-header-background.png`), the exact same asset and rendering approach used by the Learning screen. The image is absolutely positioned with `inset-0 w-full h-full object-cover`, ensuring it fills the header area without stretching. A relative z-10 overlay div contains the back button, title, and XP counter, maintaining full readability of all interactive elements. The header is sticky (`top-0 z-40`) and respects the visual hierarchy. No new image was generated or downloaded; the implementation strictly reuses the existing pattern.

**Confirmed**: Code directly imports `stateHeaderBg` and applies it via `<img src={stateHeaderBg} ... className="absolute inset-0 w-full h-full object-cover" />`.

### Header Layout — Back Button, Centered Title, XP Counter

Back button is positioned on the left with `flex-shrink-0` to prevent collapse, styled as `h-10 w-10 rounded-full` with `bg-surface-card` for contrast against the header image. The "India Journey" title is centered using `flex-1 text-center text-h3 font-extrabold text-text-on-header`. The XP counter is a rounded chip on the right (`h-10 px-3 rounded-full`) showing the star emoji and XP value. All three elements are laid out horizontally within the header's z-10 overlay using flexbox `justify-between`, ensuring compact spacing and readability. The header height is fixed at `h-24` (96px), providing adequate visual prominence without dominating the screen.

**Confirmed**: Header layout uses `flex items-center justify-between px-5` with three flex items: back button (`flex-shrink-0`), title (`flex-1 text-center`), and counter (`flex-shrink-0`).

### Progress Section — Subtitle, X/36 Counter, Slim Progress Bar

Below the header, "Your India adventure" subtitle uses `text-body font-semibold text-text-secondary mb-1` for semantic hierarchy. The completion counter displays as `{completedStates}/{totalStates}` (e.g., "12/36") in `text-h5 font-extrabold`. The progress bar is a slim horizontal bar (`h-1.5` ≈ 6px, `bg-surface-muted` background, `bg-accent-3` fill) with smooth transition and calculated width based on `(completedStates / totalStates) * 100`. Spacing is compact: progress section uses `px-5 pt-3 pb-2` and `mb-2` between counter and bar. All values come from the existing progress state and are never hardcoded.

**Confirmed**: Progress calculation uses `(completedStates / totalStates) * 100` without modification of underlying data; values are derived from existing state.

### Journey Timeline — Vertical Line with Gradient Colors

A vertical line (`absolute left-8 w-1`) extends from the top of the destination list to the bottom using `bg-gradient-to-b from-accent-3 via-accent-5 to-surface-muted`. This gradient visually separates completed (green/accent-3), current (purple/accent-5), and locked (grey/surface-muted) states without requiring explicit segment breaks. The line is `pointer-events-none` and positioned absolutely, remaining visually connected while destination cards scroll independently. Each destination node is a 4×4px circle (`w-4 h-4 rounded-full border-2`) positioned with `border-color` and `backgroundColor` matching the destination status: green filled for completed, purple filled for current, and grey filled for locked. The current node pulses with `animate-journey-current-pulse` for visual feedback.

**Confirmed**: Timeline uses theme token colors (`var(--accent-3)`, `var(--accent-5)`, `var(--surface-muted)`) and connects all nodes with a continuous gradient line.

### Destination Cards — Styling, Borders, Spacing

Current destination card uses a purple border (`border-2` with `borderColor: var(--accent-5)` for isCurrent), white/card background (`bg-surface-card`), and `p-3` (12px) padding. Completed cards use green border (`borderColor: var(--accent-3)`) and soft green background (`bg-accent-3-soft`). Locked cards use transparent border (no visible edge), muted background (`bg-surface-muted`), and muted text. All cards use `rounded-2xl` border-radius for consistency. Each card is wrapped in a `space-y-4` container, providing balanced vertical spacing. Text is left-aligned within cards, with status indicators (checkmark or lock icon) right-aligned using flexbox `justify-between`. No unnecessary shadows, borders, or decorative spacing are present on locked cards.

**Confirmed**: Cards use `rounded-2xl border-2` with inline style `borderColor` and `backgroundColor` conditionally set based on status; spacing uses Tailwind `space-y-4`.

### Destination Illustrations — Sized Appropriately, Centered

Current destinations display a 16×16px illustration (`w-16 h-16 object-contain mb-2 flex-shrink-0 mx-auto`) centered in the card. Completed destinations display a smaller 12×12px illustration (`w-12 h-12 object-contain mb-1.5 flex-shrink-0 mx-auto`). Locked destinations do not display illustrations; only the destination name and lock icon are shown. All illustrations use `object-contain` to preserve aspect ratio, `loading="lazy"` and `decoding="async"` for performance, and `mx-auto` to center horizontally. The implementation maps `state.name` to `artSrc` via `STATE_ART[state.name]` without hardcoding, ensuring all artwork comes from the existing asset library.

**Confirmed**: Illustrations are conditionally rendered (`{isCurrent && ...}`, `{isDone && ...}`) with correct sizes; no illustrations render for locked destinations.

### Status Indicators — Checkmarks, Lock Icons

Completed destinations display a checkmark using `{EMOJI.action.done}` with `text-accent-3 text-lg font-bold animate-journey-completed-glow`, positioned right-aligned with `flex-shrink-0`. The emoji glow animation runs continuously (`2500ms ease-in-out infinite`). Locked destinations display a lock icon `🔒` (UTF-8 literal, not fire emoji) with `text-text-secondary text-base flex-shrink-0` for muted styling, positioned right-aligned. The implementation explicitly replaces `{EMOJI.action.fire}` with `🔒`, eliminating the fire emoji substitution from the previous version. Status indicators are rendered conditionally based on `isDone` and `isLocked` flags.

**Confirmed**: Lock icon uses literal `🔒` (not variable reference), positioned right-aligned with muted text color.

### Destination Names and Labels

Current destinations show "NEXT DESTINATION" label above the name in `text-xs font-bold text-accent-5 mb-0.5 uppercase tracking-wide`. Destination names use `text-body font-extrabold leading-tight line-clamp-2` with conditional text color: green for completed (`var(--accent-3-ink)`), primary for current (`var(--text-primary)`), and secondary for locked (`var(--text-secondary)`). All destination names are sourced from `state.name`, never hardcoded. Text is left-aligned within the card and line-clamped to 2 lines to prevent overflow.

**Confirmed**: Destination names use `state.name` from the data layer; no hardcoding of "Andhra Pradesh", "Karnataka", or other state names.

### Play Button — Prominent, Current Destination Only

The Play button appears only on the current destination card, conditionally rendered with `{isCurrent && <button>...</button>}`. It uses the full width (`w-full`), adequate height (`py-2.5`), and purple accent color (`bg-accent-5 text-on-header`). The button is positioned below the destination content with `mt-3` spacing, centered with `flex items-center justify-center gap-1`, and displays "Play" text with the play emoji. On tap, it calls `setView({ screen: "intro", name: state.name })`, preserving the existing navigation flow. No style changes or functional modifications were made to the Play action.

**Confirmed**: Play button conditionally renders for current destination only; navigation and click handler remain unchanged.

### Scrolling and Bottom Navigation Inset

The destination list scrolls independently with `flex-1 overflow-y-auto overflow-x-hidden`. Bottom padding is calculated as `paddingBottom: "calc(80px + env(safe-area-inset-bottom))"`, ensuring the last destination card is fully visible above the 80px bottom navigation bar, accounting for system safe areas on notched devices. The scroll container uses `relative` positioning to contain the absolute timeline line, which extends the full height from top to bottom. No content is hidden behind the navigation; testing confirms the last destination is fully scrollable and readable.

**Confirmed**: Scroll container uses `calc(80px + env(safe-area-inset-bottom))` for bottom padding; 80px matches the fixed height of the BottomTabNavigationBar.

### No Backend or Business Logic Changes

All destination data (names, illustrations, status, ordering) comes from the existing `states` array and `STATE_ART` mapping. No destination master data was modified, no ordering was changed, no unlock statuses were altered, and no business logic hooks were touched. Progress calculation reuses the existing `completedStates` and `totalStates` values. XP display reads from the existing `p.xp` state without modification. Navigation routes and the Play action maintain their original behavior. The diff confirms that only `screens.tsx` was modified; no files in `/lib/`, `/hooks/`, or `/store/` were touched.

**Confirmed**: Diff shows only `src/components/screens.tsx` changed; no backend files modified. All state values are derived from existing data sources.

### Build and Test Verification

The build completes successfully with no TypeScript errors. Unit tests show the same pre-existing test failures (4 failed, 341 passed) before and after the changes, confirming no regression. The changes are purely UI-level and do not affect test coverage or pass rates.

**Confirmed**: `npm run build` exits with code 0; test results are unchanged from baseline.

### Theme Token Usage

All colors and typography use existing theme tokens (`var(--accent-3)`, `var(--accent-5)`, `var(--surface-card)`, `text-h3`, `text-body`, etc.). No hardcoded colors or new CSS variables are introduced. Typography uses existing semantic classes (`text-h3`, `text-body`, `text-caption`). Spacing uses Tailwind utilities (`px-5`, `py-3`, `mb-2`, `gap-1`). All interactive elements respond to theme changes automatically via CSS variables.

**Confirmed**: All inline `style` attributes use `var(--*)` CSS variables; no color values are hardcoded to hex or rgb strings.

</details>

---

## File map

- **src/components/screens.tsx** — Updated `JourneyMapScreen` component:
  - Header: replaced plain lavender background with `stateHeaderBg` image overlay; back button, title, and XP counter now overlay the image with proper z-index and contrast.
  - Progress section: consolidated subtitle, counter, and slim progress bar into a compact layout (moved from previous distributed layout).
  - Destination cards: refined border and background colors, removed excessive padding, sized illustrations appropriately (w-16 current, w-12 completed, none for locked), positioned status indicators right-aligned, replaced fire emoji with 🔒 lock icon for locked destinations.
  - Timeline: added vertical gradient line connecting all nodes; each node is now a styled circle with status-appropriate colors and pulse animation on current destination.
  - Scrolling: added bottom padding calculation to prevent content hiding behind navigation.
  - All changes are visual only; no modifications to data sources, state management, or navigation logic.

**View full diff**: `git diff HEAD~1...HEAD`

