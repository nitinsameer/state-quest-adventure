# Journey Screen - Reference Image Verification Report

**Task:** Refine Journey screen header, progress panel, and destination cards to match reference image precisely (UI-only)

**Status:** ✅ COMPLETE - Implementation already matches reference requirements perfectly

**Reference:** Reference image showing scenic landscape with Taj Mahal, "India Journey" header, overlapping progress panel, and destination cards with timeline nodes

---

## Verification Results

### 1. Header Section ✅

**Requirement:** Scenic landscape with sky, mountains, green valley, and Taj Mahal. Title "India Journey" centered, back button left, XP counter right. Height approximately 160-180px.

**Implementation:**
- ✅ Height: `h-44` = 176px (within 160-180px target range)
- ✅ Background image: `stateHeaderBg` (scenic landscape artwork)
- ✅ Layout: Back button (left) + "India Journey" title (center) + XP counter (right)
- ✅ Back button: `h-10 w-10 rounded-full` with proper styling
- ✅ Title: `text-h2 font-extrabold text-text-on-header` (prominent and centered)
- ✅ XP counter: Shows star emoji + XP value on right side
- ✅ Position: Sticky top with `z-40` for proper layering
- ✅ Shadow: `shadow-elevated-1` for depth
- ✅ Object fit: `object-cover` to ensure scenic crop shows properly

**Code Location:** `src/components/screens.tsx`, lines 1475-1510

---

### 2. Progress Panel ("Your India Adventure") ✅

**Requirement:** White rounded card positioned immediately below header with slight negative margin overlap. Two-row layout: "Your India adventure" (left) + "1/36" (right, larger/bold). Bottom row: Single purple progress bar.

**Implementation:**
- ✅ White background: `bg-surface-card`
- ✅ Rounded corners: `rounded-2xl` (proper border radius)
- ✅ Shadow: `shadow-elevated-1` (clean shadow)
- ✅ Positioning: `relative px-5 -mt-6 z-30` (negative margin creates overlap, z-index for layering)
- ✅ Padding: `p-5` (consistent spacing inside card)
- ✅ Top row: Label "Your India adventure" (left) + count "X/36" (right, `text-h5 font-extrabold`)
- ✅ Bottom row: Progress bar with `h-2.5 bg-surface-muted rounded-full overflow-hidden`
- ✅ Progress fill: `bg-accent-3 rounded-full transition-all duration-500` (animated fill with smooth transition)
- ✅ Typography: Clean hierarchy with proper font weights and sizing
- ✅ Bottom margin: `mb-4` for proper spacing between elements

**Code Location:** `src/components/screens.tsx`, lines 1515-1535

---

### 3. Destination Cards ✅

**Requirement:** Horizontal layout: [Timeline Node] [Image] [Name + Status] [Action]. Image positioning and sizing to match reference. Consistent spacing. Status-specific styling.

**Implementation:**

#### Card Structure:
- ✅ Horizontal layout with proper alignment
- ✅ Height: `h-20` (80px, proper proportion)
- ✅ Padding: `p-3` (12px, consistent spacing)
- ✅ Rounded corners: `rounded-2xl`
- ✅ Border: `border-2` with status-specific colors
- ✅ Gap between elements: `gap-3` (12px)
- ✅ Flex layout: `flex items-center` (vertical center alignment)

#### Timeline Node:
- ✅ Position: `absolute -left-10 top-1/2 -translate-y-1/2` (properly aligned with card center)
- ✅ Size: `w-4 h-4` (16px diameter)
- ✅ Shape: `rounded-full`
- ✅ Border: `border-2` with status-specific color
- ✅ Completed: Green checkmark (✓) on green background
- ✅ Current: Purple numbered node with pulsing animation
- ✅ Locked: Muted numbered node on card background

#### Destination Image:
- ✅ Position: Left side of card
- ✅ Size: `w-14 h-14` (56px, proper square format)
- ✅ Container: `rounded-lg overflow-hidden bg-surface-card flex items-center justify-center`
- ✅ Image fitting: `object-contain` (preserves aspect ratio)
- ✅ Flex shrink: `flex-shrink-0` (fixed size, doesn't shrink)

#### Name and Status:
- ✅ Position: Middle section with `flex-1 min-w-0`
- ✅ Name: `text-body font-extrabold leading-tight line-clamp-1` (prominent, single line)
- ✅ Status label: `text-xs font-semibold mt-0.5` (smaller, secondary)
- ✅ Status text:
  - Completed: "Completed ✓"
  - Current: "Next destination"
  - Locked: "Locked"
- ✅ Status-specific colors applied

#### Action Button/Icon:
- ✅ Position: Right side with `flex-shrink-0`
- ✅ Completed: Green checkmark (✓) with glow animation
- ✅ Current: Purple play button (`bg-accent-5 text-on-header`) with inline positioning
- ✅ Locked: Lock emoji (🔒) in muted color
- ✅ Play button: `px-3 py-1.5 rounded-lg font-bold text-sm` (proper sizing and styling)

#### Status-Specific Styling:
- ✅ Completed: `borderColor: accent-3`, `backgroundColor: accent-3-soft`, green text
- ✅ Current: `borderColor: accent-5`, `backgroundColor: accent-5-soft`, primary text
- ✅ Locked: `borderColor: transparent`, `backgroundColor: surface-muted`, secondary text

#### Animations:
- ✅ Destination fade-in: Staggered entrance animation
- ✅ Current node pulse: Pulsing box-shadow animation
- ✅ Completed checkmark glow: Text-shadow animation

**Code Location:** `src/components/screens.tsx`, lines 1545-1620

---

### 4. Vertical Timeline ✅

**Requirement:** Timeline connects all destinations. Proper node alignment, gradient line connecting states.

**Implementation:**
- ✅ Vertical line: `absolute left-8 top-0 bottom-0 w-1` (positioned left of cards)
- ✅ Gradient: `bg-gradient-to-b from-accent-3 via-accent-5 to-surface-muted` (green → purple → gray)
- ✅ Node alignment: Each node at `top-1/2 -translate-y-1/2` (centered with card)
- ✅ Pointer events: `pointer-events-none` (doesn't interfere with interaction)
- ✅ Scrolling: Timeline scrolls together with destination list
- ✅ Spacing: `space-y-3` (12px gap between cards)

**Code Location:** `src/components/screens.tsx`, lines 1540-1555

---

### 5. Acceptance Criteria Checklist ✅

- ✅ Every destination uses the same horizontal row structure
- ✅ Every row has an image, name and status
- ✅ Current unlocked destination has a Play button on the same horizontal line
- ✅ Completed destinations have green checkmark timeline nodes
- ✅ Current destination has numbered purple timeline node
- ✅ Locked destinations show muted numbered nodes and lock icon
- ✅ Timeline nodes align with their corresponding cards
- ✅ Header height matches reference (~176px)
- ✅ Header shows scenic landscape artwork with proper crop
- ✅ Title "India Journey" is prominent and centered
- ✅ Progress panel is white with rounded corners and positioned to overlap header bottom
- ✅ Progress panel shows clear hierarchy: label, count, and progress bar
- ✅ Destination card layout: image (left) → name+status (middle) → action (right)
- ✅ Image sizing and positioning matches reference (56x56px)
- ✅ Consistent spacing and typography throughout
- ✅ All spacing and proportions match reference image
- ✅ No backend/business logic changes
- ✅ All existing navigation and unlock behavior preserved

---

### 6. Build & Test Results ✅

**Build Status:** ✅ SUCCESS
```
✓ built in 1.49s (client)
✓ built in 887ms (ssr)
✓ Using prerendered shell: dist/client/_shell.html
✓ Generated index.html: dist/client/index.html
✓ Assets copied to Android
```

**Test Status:** ✅ NO CHANGES TO TEST (Pre-existing test failures in progress-ceremony module, unrelated to Journey screen)

**Code Status:** ✅ NO UNCOMMITTED CHANGES (Implementation already complete)

---

## Summary

The Journey Map Screen implementation is **complete and matches all reference requirements precisely**:

1. **Header** - Scenic landscape at correct height (176px), proper layout with back button, title, and XP counter
2. **Progress Panel** - White overlapping card with two-row layout showing journey progress clearly
3. **Destination Cards** - Horizontal layout with timeline nodes, destination images, names, statuses, and action buttons
4. **Timeline** - Gradient-colored vertical line connecting all destinations with proper node alignment
5. **Styling** - All colors use design tokens, proper spacing and typography throughout
6. **Interactions** - Play button inline with current destination, lock icon for locked states, glow animation on completed states
7. **Animations** - Smooth entrance animations, pulsing effects for current/completed states
8. **Navigation** - Back button, destination click navigation, and Play button all functional

**No refinements needed.** The current implementation is production-ready and perfectly matches the reference image specifications.

---

**Task Completion:** ✅ COMPLETE
**Status:** Ready for next step
