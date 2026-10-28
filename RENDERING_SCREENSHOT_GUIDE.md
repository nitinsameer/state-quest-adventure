# Learning Hub Screen - Browser Verification Screenshot Guide

## How to Capture & Verify Screenshots

### Step 1: Start Dev Server
```bash
cd d:\NishaanTech\state-quest-adventure
npm run dev
```
Server should start at http://localhost:8080 (or similar port shown in terminal)

### Step 2: Navigate to Learning Hub
1. Open http://localhost:8080 in browser
2. Click "Start Journey" or navigate through intro
3. Select a region (e.g., Southern Region)
4. Select a state (e.g., Andhra Pradesh)
5. Click the state to enter "Learning Hub" view

### Step 3: Set Viewport to Mobile Size
**Chrome DevTools:**
1. Press F12 to open DevTools
2. Click mobile icon (Cmd/Ctrl + Shift + M)
3. Set viewport to **375px width** (typical Android mobile)
4. Set device to "Pixel 4" or "Galaxy S9+" preset

**Firefox DevTools:**
1. Press F12 to open DevTools
2. Click responsive design icon (Cmd/Ctrl + Shift + M)
3. Set width to **375px**

### Step 4: Capture Screenshot
- Press Cmd/Ctrl + Shift + S (native screenshot tool)
- Or use DevTools screenshot button
- Save as `RENDERED_SCREENSHOT_[STATE_NAME].png`
- Example: `RENDERED_SCREENSHOT_ANDHRA_PRADESH.png`

---

## Reference Screenshots - What to Expect

### Header Section (Expected Appearance)

```
┌──────────────────────────────────────────┐
│ Journey • Southern Region                │  ← Breadcrumb (top)
│                                          │
│ ‹     ⭐ 0 STARS                        │  ← Back button | Star counter
│                                          │
│      Learning Hub                        │  ← Label
│    ANDHRA PRADESH                        │  ← State name (bold, large)
│    🏆 Day 1 streak                       │  ← Streak indicator
│                                          │
└──────────────────────────────────────────┘
```

**Key Details:**
- Header height should be ~192px
- Text is white on semi-transparent header
- Back button (‹) is left-aligned, semi-transparent
- Star counter is right-aligned, semi-transparent
- All text centered vertically under back/star row

### Progress Panel (Expected Appearance)

```
    ┌────────────────────────────────────┐
┌───┤ Your state adventure           0/6 ├─────┐  ← Overlaps header
│   │ ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │     │  ← Progress bar
│   └────────────────────────────────────┘     │
│                                              │
│  Challenge Cards Grid Below...               │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Panel starts ~16px above bottom of header (-mt-4)
- Rounded corners with subtle shadow
- "Your state adventure" label on left
- Progress count "0/6" on right
- Progress bar shows 0% initially (after card visits, fills up)
- White background with good contrast

### Challenge Cards Grid (Expected Appearance)

```
┌─────────────────────────────────────┐
│  01   🏛️  ✓        02       🗣️       │
│  Capital          Language          │
│  Amaravati        Telugu            │
│                                     │
│  0/4 cards    →    0/4 cards   →    │
├─────────────────────────────────────┤
│  03       🍛       04      🛕        │
│  Famous Food      Places            │
│  Pulihora        Tirupati Temple    │
│                                     │
│  0/3 cards    →    0/4 cards   →    │
├─────────────────────────────────────┤
│  05      🦌        06       💡       │
│  State Animal     Fun Fact           │
│  Blackbuck       "Its spicy..."      │
│                                     │
│  0/4 cards    →    0/3 cards   →    │
└─────────────────────────────────────┘
```

**Card Layout Details (each card):**
- Top-left: Number badge (01-06) - colored circle, white text
- Top-right: Emoji icon (state-specific)
- Center: Bold title + subtitle text
- Bottom-left: Progress count (e.g., "0/4 cards")
- Bottom-right: Arrow button (→) OR lock icon (🔒)

**Card Colors (reference):**
- Card 1 (Capital): Orange badge, white/light background, **orange border** (active)
- Card 2 (Language): Purple badge, lavender background
- Card 3 (Food): Orange/Red badge, peach background
- Card 4 (Places): Red/Pink badge, pink background
- Card 5 (Animal): Green badge, light green background
- Card 6 (Fact): Blue badge, light blue background

**Initial State (0 cards completed):**
- Card 1 should have orange accent border (active state)
- Other cards have subtle pastel borders
- No checkmarks (✓) visible yet
- All cards clickable
- Arrow buttons visible on all

### Quiz Panel (Expected Appearance)

#### Locked State (0-5/6 cards):
```
┌──────────────────────────────────────┐
│  🔒  State Quiz Locked               ✨ │
│  Complete all 6 challenges to        │
│  unlock it.                          │
└──────────────────────────────────────┘
```

**Styling:**
- Light purple/lavender background (accent-5-soft)
- Lock icon (🔒) in semi-transparent circle
- Title: "State Quiz Locked"
- Subtitle: "Complete all 6 challenges to unlock it."
- Sparkle (✨) dimmed (~40% opacity)
- No button visible

#### Unlocked State (6/6 cards):
```
┌──────────────────────────────────────┐
│  🔓  State Quiz Unlocked!            ✨ │
│  Ready to test your knowledge?       │
│                                      │
│  [ 🚀 Start State Quiz ]             │
└──────────────────────────────────────┘
```

**Changes when unlocked:**
- Lock icon changes to 🔓 (unlocked)
- Background becomes more opaque (darker lavender)
- Title changes to "State Quiz Unlocked!"
- Subtitle changes to "Ready to test your knowledge?"
- Sparkle (✨) animates with bouncing motion (100% opacity)
- Blue button appears: "🚀 Start State Quiz"

---

## Comparison Checklist for Screenshots

### Header Section ✓
- [ ] Breadcrumb text visible: "Journey • Southern Region"
- [ ] Back button (‹) is circular, semi-transparent
- [ ] Star counter (⭐) shows correct number (should start at 0)
- [ ] "Learning Hub" label visible and centered
- [ ] State name large and bold (e.g., "Andhra Pradesh")
- [ ] "🏆 Day 1 streak" visible below state name
- [ ] Header height approximately 192px

### Progress Panel ✓
- [ ] Panel overlaps header by ~16px (negative margin visible)
- [ ] "Your state adventure" text visible on left
- [ ] Progress count shows "0 / 6" (or current count)
- [ ] Progress bar visible with fill percentage
- [ ] Bar background is light (accent-5-soft)
- [ ] Bar fill is colored (accent-5)
- [ ] Rounded corners on panel
- [ ] Subtle shadow present

### Challenge Cards ✓
- [ ] 2 columns of cards (2 per row)
- [ ] Exactly 6 cards visible
- [ ] Card 1 visible: "Capital" with number badge "01"
- [ ] Each card has rounded corners
- [ ] Each card has subtle shadow
- [ ] Card 1 has **orange accent border** (thick, visible)
- [ ] Other cards have thin borders with pastel colors
- [ ] Number badges are colored circles (1-6)
- [ ] Emoji icons visible in top-right of each card
- [ ] Card titles are bold (Capital, Language, etc.)
- [ ] Card subtitles visible (Amaravati, Telugu, etc.)
- [ ] Progress counts visible (e.g., "0/4 cards")
- [ ] Arrow buttons visible in bottom-right (colored)
- [ ] Text doesn't overflow or clip

### Quiz Panel ✓
- [ ] Panel visible at bottom of scrollable area
- [ ] Background color is lavender-ish (accent-5-soft)
- [ ] Lock icon (🔒) visible in left circle
- [ ] "State Quiz Locked" heading visible
- [ ] "Complete all 6 challenges to unlock it." subtitle visible
- [ ] Sparkle emoji (✨) on right side (dimmed)
- [ ] No button visible (locked state)

### Overall Layout ✓
- [ ] No horizontal scrolling (fits within 375px)
- [ ] Content scrolls vertically
- [ ] Header stays fixed while scrolling
- [ ] Bottom of quiz panel has safe spacing
- [ ] All text readable (good contrast)
- [ ] No clipped or hidden content
- [ ] Mobile proportions look natural

### Colors ✓
- [ ] Background is light (matches theme)
- [ ] Text is dark/readable on light background
- [ ] Accent colors are vibrant (orange, purple, etc.)
- [ ] Pastel backgrounds are soft (not harsh)
- [ ] No bright colors that seem out of place

### Animations ✓
- [ ] Cards appear with staggered entrance (hover over them)
- [ ] Buttons have subtle scale effect on click
- [ ] Progress bar transitions smoothly (if you complete cards)

---

## Testing Interactions

### Test 1: Navigate Back
1. Click back button (‹)
2. Should navigate to previous screen (state intro or region list)
3. Should play click sound effect

### Test 2: Click a Card
1. Click Card 1 (Capital)
2. Should navigate to learning card screen
3. Should see questions for Capital category
4. Should play click sound effect

### Test 3: Complete a Category (if possible in test data)
1. If test data shows a completed category:
   - Should see ✓ checkmark on card
   - Card text color might change
   - Progress bar should increase
2. If at 3/6 completion:
   - Should see toast: "Halfway there! ⭐ 3/6 categories explored!"
3. If at 6/6 completion:
   - Quiz panel should show unlocked state
   - Button should be clickable
   - Should see celebration modal

### Test 4: Unlock Quiz (if at 6/6)
1. Click "🚀 Start State Quiz" button
2. Should navigate to quiz screen
3. Should play click sound effect

---

## Common Issues to Watch For

### Layout Issues:
- ❌ Text overflow or clipping
- ❌ Horizontal scrolling at 375px width
- ❌ Cards not aligned in 2-column grid
- ❌ Content hidden behind header or nav
- ❌ Header not staying fixed while scrolling

### Styling Issues:
- ❌ Wrong colors (not matching theme)
- ❌ Text hard to read (low contrast)
- ❌ Buttons not visually distinct
- ❌ Card borders not visible
- ❌ Spacing inconsistent between elements

### Asset Issues:
- ❌ Header background image missing
- ❌ State art not loading
- ❌ Emoji not rendering correctly
- ❌ Animations not playing

### Functional Issues:
- ❌ Back button doesn't work
- ❌ Card clicks don't navigate
- ❌ Progress not updating
- ❌ Quiz button not clickable when complete

---

## Theme Verification

The app supports multiple themes. Test at least 2 themes to verify colors adapt:

### Light Theme (Default):
- Background: Light cream/beige
- Text: Dark navy/black
- Accents: Vibrant colors

### Dark Theme (Cyber, Aurora, OLED):
- Background: Dark
- Text: Light/white
- Accents: Bright, high-contrast colors

**Expected**: All text readable, colors appropriate for theme

---

## Mobile Browser Testing

### Recommended Browsers:
1. **Chrome** (best DevTools, most accurate)
2. **Firefox** (good mobile simulation)
3. **Safari** (if testing on Mac/iOS)

### Recommended Devices (in DevTools):
- iPhone 12 / 13 (375px width)
- Pixel 4 / 5 (411px width)
- Galaxy S9+ (360px width)

**Note**: Test at exactly 375px width as specified in reference

---

## Screenshot Naming Convention

When capturing screenshots, use this naming:

```
RENDERED_SCREENSHOT_[STATE]_[THEME]_[STATUS].png

Examples:
- RENDERED_SCREENSHOT_ANDHRA_PRADESH_DEFAULT_0OF6.png
- RENDERED_SCREENSHOT_RAJASTHAN_DARK_6OF6_UNLOCKED.png
- RENDERED_SCREENSHOT_TAMIL_NADU_DEFAULT_3OF6_HALFWAYTHERE.png
```

Save all screenshots to: `d:\NishaanTech\state-quest-adventure\screenshots/`

---

## Final Verification Document

After capturing screenshots, fill out this form:

```
STATE TESTED: [e.g., Andhra Pradesh]
BROWSER: [e.g., Chrome 120]
VIEWPORT: 375px width
THEME: [Default / Cyber / Aurora / etc.]
COMPLETION: [0/6, 3/6, 6/6]

HEADER: ✓ / ✗
- Breadcrumb: ✓ / ✗
- Back button: ✓ / ✗
- Star counter: ✓ / ✗ (count: ___)
- State name: ✓ / ✗
- Streak: ✓ / ✗

PROGRESS PANEL: ✓ / ✗
- Overlap visible: ✓ / ✗
- Progress count: ✓ / ✗ (shows: ___)
- Progress bar: ✓ / ✗ (fill: __%)

CARDS: ✓ / ✗
- 2-column grid: ✓ / ✗
- All 6 cards: ✓ / ✗
- Card 1 orange border: ✓ / ✗
- Checkmarks visible: ✓ / ✗ (count: ___)
- Arrows visible: ✓ / ✗
- Text wrapping: ✓ / ✗

QUIZ PANEL: ✓ / ✗
- Lock/Unlock icon: ✓ / ✗ (shows: 🔒 / 🔓)
- Title: ✓ / ✗
- Button visible: ✓ / ✗ (if 6/6)

LAYOUT: ✓ / ✗
- No horizontal scroll: ✓ / ✗
- Content scrolls vertically: ✓ / ✗
- No clipping: ✓ / ✗
- Header stays fixed: ✓ / ✗

COLORS: ✓ / ✗
- Text readable: ✓ / ✗
- Accents correct: ✓ / ✗
- Theme applied: ✓ / ✗

ISSUES FOUND:
[List any visual differences from reference]

CONCLUSION:
[ ] Matches reference perfectly
[ ] Minor visual differences (acceptable)
[ ] Major differences (needs fixes)
```

---

**Next Step**: Open browser, navigate to Learning Hub, and capture screenshot to verify rendering matches this guide.
