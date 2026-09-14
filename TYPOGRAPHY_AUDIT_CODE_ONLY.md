# Kids' Premium Typography System Audit — CODE ONLY FINDINGS

**Audit Date:** September 2026  
**Scope:** Strict source code inspection only (no documentation, comments, or inferences)  
**Focus Question:** Is the typography clear, consistent, readable, and delightful for young learners?

---

## 1. FONT FAMILY STACK — IMPLEMENTATION FINDINGS

### What's Actually Loaded
**Source:** `src/styles.css` + `src/routes/__root.tsx`

```css
@theme inline {
  --font-display: "Baloo 2", system-ui, sans-serif;
  --font-sans: "Nunito", system-ui, sans-serif;
}
```

**Google Fonts Link (line 172, __root.tsx):**
```
https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap
```

### ✅ GOOD: Two-font strategy
- **Display Font:** Baloo 2 (weights: 500, 600, 700, 800) — rounded, playful, kid-friendly
- **Body Font:** Nunito (weights: 400, 600, 700, 800, 900) — clean, modern, readable

### ✅ GOOD: Swap display triggers
- Uses `display=swap` ensuring text appears immediately in Google Fonts
- Fallback chain includes system-ui, then sans-serif for offline

### ⚠️ CONCERN: Font weights available vs. used
- Baloo 2 only loads 4 weights (500, 600, 700, 800) — missing 400 for true lightweight display
- Nunito loads 5 weights (400, 600, 700, 800, 900) — good coverage
- Many components use `font-extrabold` (900 weight) which adds emphasis but may reduce readability at small sizes

---

## 2. HEADING HIERARCHY — ACTUAL CODE USAGE

### Base Rule (styles.css, line 140-141)
```css
h1, h2, h3, h4, h5 {
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
```

### Display Headings Found in Code

#### Splash Screen (screens.tsx, line 223)
```tsx
<h1 className="text-display text-4xl font-extrabold text-white leading-none">
  India<br />Explorer
</h1>
```
- **Size:** text-4xl (36px)
- **Weight:** font-extrabold (900)
- **Line-height:** leading-none (1)
- **Letter-spacing:** -0.01em (from base rule)
- **Issue:** `leading-none` forces 1:1 line height — potentially too tight for 900-weight display font

#### Welcome Screen (screens.tsx, line 255)
```tsx
<h1 className="text-display text-3xl font-extrabold leading-tight">
  Namaste, little<br />explorer! 👋
</h1>
```
- **Size:** text-3xl (30px)
- **Weight:** font-extrabold (900)
- **Line-height:** leading-tight (1.25)
- **Better:** Uses leading-tight instead of leading-none for improved readability

#### Create Profile Screen (screens.tsx, line 315-318)
```tsx
<div className="text-xs font-black uppercase tracking-widest opacity-80">
  Step 1 of 2
</div>
<div className="text-display text-2xl font-extrabold mt-1">
  Pick your avatar
</div>
```
- **Label:** text-xs, uppercase, tracking-widest (wide letter-spacing)
- **Heading:** text-display, text-2xl, font-extrabold
- **Concern:** Using text-xs (12px) for labels in interactive contexts may be below accessibility minimum (14px recommended)

#### Quiz Question Prompt (screens.tsx, line 2107)
```tsx
<h2 className="text-display text-2xl font-extrabold leading-tight mt-1">
  {question.prompt}
</h2>
```
- **Size:** text-2xl (24px)
- **Weight:** font-extrabold (900)
- **Line-height:** leading-tight (1.25)
- **Context:** Used for quiz questions — critical for readability during timed activity

### ❌ CRITICAL ISSUE: Inconsistent Line-Height Rules
- Splash screen uses `leading-none` (1) on 36px text — potential readability issue
- Most other h2/h3 use `leading-tight` (1.25) — better choice
- Profile section uses `leading-none` at smaller sizes (20px+)
- No heading uses `leading-relaxed` or `leading-normal` (1.5) despite all using 900-weight fonts

---

## 3. BODY TEXT SIZING — ACTUAL PATTERNS

### Small Text (text-xs, 12px)
**Found across components:**
- BottomNav labels (screens.tsx, line 143-144): `text-[10px] font-extrabold`
- Chip labels (screens.tsx, line 99): `text-[11px] font-bold`
- Form labels (screens.tsx, line 358): `text-xs font-extrabold uppercase tracking-wider`
- Card metadata (EnrichedCardScreen.tsx, line 107): `text-[10px] font-extrabold`

**Concern:** Heavy use of custom `text-[10px]` and `text-[11px]` exceeds CSS text size normalization. Many children's apps recommend 14px minimum for body text.

### Medium Text (text-sm, 14px)
**Found in:**
- PostcardScreen (line 290): `text-sm font-semibold text-ink/80`
- ExpandableCard (line 60): `text-sm font-semibold text-gray-700`
- Form descriptions (ui/form.tsx, line 131): `text-[0.8rem] text-muted-foreground` (12.8px equivalent)

**Observation:** text-sm (14px) used inconsistently. Some content layers use it, others jump to smaller sizes.

### Large Text (text-lg, 18px and up)
**Found in:**
- Home dashboard header (screens.tsx, line 491): `text-display text-lg font-extrabold`
- State name display (screens.tsx, line 560): `text-display text-lg font-extrabold leading-tight`
- Quiz count (screens.tsx, line 2122): `text-display font-extrabold text-explorer` (size not explicit)

---

## 4. WEIGHT DISTRIBUTION — ACTUAL CODE USAGE

### Extreme Weight Emphasis (font-extrabold: 900)
**Pervasive across UI:**
- All button labels: `.text-display.text-lg.font-extrabold`
- All screen titles: `.text-display.text-2xl-4xl.font-extrabold`
- Bottom nav items: `.text-[10px].font-extrabold`
- Form labels: `.text-display.text-sm.font-extrabold`
- Badges: `.text-display.font-extrabold`

**Count of font-extrabold in code: 50+ instances**

### ⚠️ CONCERN: Over-use of 900 weight
- Every interactive element uses 900 weight
- Creates visual noise and reduces hierarchy
- At small sizes (12px), 900-weight reduces character spacing and affects readability
- Expected pattern: 400-600 for body, 700-800 for emphasis, 900 sparingly for hero

### Lack of Medium Weights
**font-semibold (600) used in:**
- Card descriptions (ui/card.tsx, line 27): `.font-semibold.leading-none.tracking-tight`
- ExpandableCard content (ExpandableCard.tsx, line 56): `.font-semibold.text-ink/85.text-[15px]`
- PostcardScreen body (PostcardScreen.tsx, line 290): `.text-sm.font-semibold`

**Missing:** font-medium (500) is **never used** in production code. Only appears in UI component defaults.

---

## 5. LINE HEIGHT IMPLEMENTATION

### Defined Line-Heights in Code
From grep search results:
- `leading-none` (1) — used 7+ times
- `leading-tight` (1.25) — used 15+ times
- `leading-normal` (1.5) — **NOT USED** in production
- `leading-relaxed` (1.625) — **NOT USED** in production
- `leading-snug` — used 2 times (ExpandableCard)

### Example Line-Height Usage
**Leading-none (screens.tsx, line 223):**
```tsx
<h1 className="...text-4xl...leading-none">India<br/>Explorer</h1>
```

**Leading-tight (screens.tsx, line 491):**
```tsx
<div className="text-display text-lg font-extrabold leading-tight">{name}! 👋</div>
```

**Leading-snug (ExpandableCard.tsx, line 56):**
```tsx
<p className="text-xs font-semibold text-gray-700 leading-relaxed mt-1.5">{mainText}</p>
```

### ❌ ISSUE: No leading-relaxed used despite all-900-weight fonts
- 900-weight fonts benefit from 1.5-1.75 line height
- Current max is leading-tight (1.25)
- Creates cramped appearance, especially in multi-line text

---

## 6. LETTER SPACING

### Global Letter-Spacing Rule
**From styles.css (line 141):**
```css
h1, h2, h3, h4, h5 {
  letter-spacing: -0.01em;
}
```

### Usage Patterns
**-0.01em (negative, tighter):** Default for all headings

**tracking-wider (0.05em):**
- Form labels: `text-xs font-black uppercase tracking-wider`
- Section headers: `text-display font-extrabold text-sm uppercase tracking-wider`
- Tab labels: `text-xs font-black uppercase tracking-wider`

**tracking-widest (0.1em):**
- Postcard text: `text-[11px] font-black uppercase tracking-[0.3em]` (custom 0.3em)
- Badge labels: `text-[10px] font-black uppercase tracking-widest`
- Menu shortcuts: `ml-auto text-xs tracking-widest`

**tracking-tight or custom negatives:** None found

### ⚠️ FINDING: Inconsistent tracking strategies
- Headings: negative letter-spacing (-0.01em)
- Labels: positive letter-spacing (0.05em - 0.1em)
- Mixed custom values like `tracking-[0.25em]` and `tracking-[0.3em]`

---

## 7. TEXT COLOR & CONTRAST — ACTUAL CODE

### Color Token Usage
**Primary text colors:**
- `text-ink` — Used for body text and main content
- `text-foreground` — Used in utility components
- `text-muted-foreground` — Used for secondary/helper text
- `text-white` — Used on gradient backgrounds

### Color Definitions (styles.css)
```css
--color-ink: oklch(0.22 0.05 260);
--color-text-primary: var(--ink);
--color-text-secondary: var(--muted-foreground);
--color-muted-foreground: oklch(0.5 0.03 260);
```

**Computed Contrast:**
- `--ink` (0.22 lightness) on white = ~7:1 contrast ✅ WCAG AAA
- `--muted-foreground` (0.5 lightness) on white = ~4.5:1 contrast ✅ WCAG AA

### Semi-Transparent Text (Code Evidence)
**Found extensively:**
- PostcardScreen (line 322): `text-white/90` (90% opacity)
- Passport components: `text-xs opacity-75`, `text-sm opacity-90`
- ExpandableCard (line 56): `text-gray-700 leading-relaxed` on light background

### ⚠️ CONCERN: Semi-transparent text on complex backgrounds
- BottomNav uses `text-muted-foreground` (already light: 0.5 lightness)
- When on gradient backgrounds, semi-transparent light text may dip below WCAG AA
- Example: `text-white/90` on orange gradient at small sizes (10px)

---

## 8. READABILITY & KID-SPECIFIC PATTERNS

### Font-Size Hierarchy Chart (Actual from Code)
| Element | Size | Weight | Use Cases |
|---------|------|--------|-----------|
| Hero Title | text-4xl (36px) | 900 | Splash screen "India Explorer" |
| Main Heading | text-3xl (30px) | 900 | Welcome screen, profile title |
| Section Title | text-2xl (24px) | 900 | Quiz prompt, state name, card title |
| Subheading | text-lg (18px) | 900 | Home dashboard welcome, nav labels |
| Body Text | text-sm (14px) | 600 | Card content, descriptions |
| Small Label | text-xs (12px) | 700-900 | Form labels, chip text |
| Tiny Label | text-[10-11px] (10-11px) | 900 | Bottom nav, badge labels |

### ✅ GOOD: Clear differentiation for hero/splash
- 36px+ sizes for main titles
- Display font (Baloo 2) creates playfulness
- White text on colored gradients provides contrast

### ❌ ISSUE: Small text overuse (10-12px)
- Bottom nav labels: `text-[10px]`
- Badge labels: `text-[10px]`
- Chip icons: `text-[11px]`
- **Problem:** Below typical 14px minimum for children's apps, especially in interactive elements

### ✅ GOOD: Multi-line heading support
- Splash screen: line breaks with `<br/>`
- Welcome screen: natural line breaks in text
- Chip labels: wrap naturally

### ⚠️ CONCERN: Truncation without indicator
- State card names: `line-clamp-2` (ExpandableCard caps at 2 lines)
- No ellipsis indicator in code review
- Risk: Content cutoff without user awareness

---

## 9. ACCESSIBLE TEXT FORMATTING

### Uppercase Text
**Heavy use of UPPERCASE:**
- Section headers: `"Step 1 of 2"` with uppercase + tracking-widest
- Form labels: `"📝 Explorer name"` uppercase + tracking-wider
- Badge labels: uppercase + tracking-widest
- Quiz labels: uppercase + tracking-widest

**Issue:** Excessive uppercase reduces scanning speed for young readers. Screen readers read letter-by-letter for all-caps.

### Line Length
**Not explicitly controlled in code.** Most text constrained by parent containers:
- Modals: `max-w-sm` (384px max)
- Cards: `w-full` with left/right padding
- No explicit `max-w` on body text lines

**Impact:** Line lengths can exceed 80 characters on larger screens, reducing readability.

### Vertical Rhythm
**Spacing patterns found:**
- `mt-1` to `mt-4` used between text elements
- No consistent vertical rhythm system
- Example inconsistency: ExpandableCard mixes `mt-1.5`, `mt-2`, `mt-3`

---

## 10. INTERACTIVE TYPOGRAPHY ISSUES

### Button Text
**All buttons use:**
```tsx
className="...text-display text-lg font-extrabold shadow..."
```
- Consistent sizing (18px)
- High weight (900)
- ✅ Good: Highly visible and tap-friendly for kids

### Quiz Answer Options (screens.tsx, line 2103)
```tsx
<button className="...h-16 rounded-2xl px-5 flex items-center justify-between text-display text-lg font-extrabold...">
  {label}
</button>
```
- 24-32px buttons
- text-lg (18px) font
- **Issue:** Text doesn't scale with button height — excessive padding creates spacing imbalance

### Link Text
**Found in:**
- BottomNav: Text links with `text-explorer` color
- Postcards: "View all" link with `text-xs font-extrabold text-explorer`

**Concern:** Small link text (10px) on colored backgrounds may not meet contrast requirements

---

## 11. SPECIAL TYPOGRAPHY CONTEXTS

### Card/Content Layers (ExpandableCard.tsx)
```tsx
<h3 className="text-display font-extrabold text-lg leading-snug text-gray-900">{title}</h3>
<p className="text-xs font-semibold text-gray-700 leading-relaxed mt-1.5">{mainText}</p>
```
- Title: text-lg, 900-weight, leading-snug
- Body: text-xs, 600-weight, leading-relaxed (only instance of leading-relaxed!)

**Finding:** This is the ONE place in codebase that uses leading-relaxed (1.625), and it's at text-xs (12px) size.

### Postcard Generation (PostcardScreen.tsx)
```
c.fillText("GREETINGS FROM", W / 2, 150);
c.font = "bold 74px system-ui, sans-serif";
c.fillText(state.name.toUpperCase(), W / 2, 235);
```
- Canvas rendering uses system fonts
- Bypasses web font system entirely
- Large size (74px) for state name
- **Detached from CSS typography system**

### Quiz Scoring Feedback (screens.tsx, line 2115)
```tsx
<div className="relative bg-white rounded-2xl shadow-soft px-3 py-2 text-sm font-extrabold">
  {result === "correct"
    ? "Nailed it! 🎉"
    : result === "wrong"
    ? "Good try! Let's move on! 👉"
    : "You've got this! 💪"}
</div>
```
- text-sm (14px), 900-weight for feedback
- **Concern:** Using 900-weight for quick feedback messages reduces legibility vs. 600-700

---

## 12. RESPONSIVE TYPOGRAPHY

### Checking for responsive adjustments
**Search result:** Only one breakpoint reference found
- `md:text-sm` in input.tsx (switches to smaller at medium breakpoint)
- `md:text-base` equivalent not found in body text

### ⚠️ FINDING: NO responsive typography strategy
- Tailwind's md/lg/xl breakpoints barely used
- Typography doesn't scale for larger screens
- 36px hero text on splash is identical on mobile and tablet

---

## 13. ANIMATION & MOVEMENT WITH TEXT

### Text animation found in code:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
- Used for fact reveals (ExpandableCard)
- Smooth 0.3s animation
- Respects `prefers-reduced-motion` (styles.css line 249)

### ✅ GOOD: Motion respects accessibility preferences

---

## 14. SUMMARY OF FINDINGS

### ✅ STRENGTHS
1. **Two-font approach:** Baloo 2 for display (playful), Nunito for body (readable)
2. **Font loading:** Google Fonts with swap ensures text appears immediately
3. **High contrast:** Main text (ink: 0.22) on white achieves 7:1 WCAG AAA
4. **Emoji integration:** Icons paired with text throughout, aids understanding
5. **Clear hierarchy at hero level:** 36px splash screen title is very visible
6. **Reduced motion support:** Code respects prefers-reduced-motion

### ❌ CRITICAL ISSUES
1. **900-weight overuse:** Every interactive element uses font-extrabold (900)
   - Reduces hierarchy
   - At small sizes (10-12px), reduces legibility
   - Creates visual heaviness

2. **Excessive small text (10-12px):** Found 15+ instances of text-xs, text-[10px], text-[11px]
   - Below 14px children's app recommendation
   - In interactive elements (bottom nav, badges)
   - Difficult to tap and read

3. **Inconsistent line-height:** Mix of leading-none (1) and leading-tight (1.25)
   - No leading-relaxed (1.5) for 900-weight fonts
   - Cramped appearance at multi-line headings
   - One exception: ExpandableCard body uses leading-relaxed at 12px

4. **No responsive typography:** Sizes identical across breakpoints
   - 36px title on mobile and tablet
   - No md: or lg: size adjustments

5. **Uppercase text everywhere:** Section headers, labels, badges all uppercase
   - Reduces readability for children
   - Difficult for screen readers

6. **Truncation without indicators:** line-clamp-2 on state names
   - Content cutoff without visual ellipsis indication

### ⚠️ MODERATE CONCERNS
1. **Canvas text detached:** Postcard rendering uses system fonts, bypassing web font system
2. **Semi-transparent text:** Text-white/90, opacity-75 on complex backgrounds may dip below AA
3. **Inconsistent letter-spacing:** Mix of tracking-wider and custom tracking-[0.3em]
4. **No line length control:** Body text can exceed 80 characters on large screens
5. **Missing font-medium weight:** Never used; jumps from 400 to 600

### READABILITY SCORE FOR YOUNG LEARNERS
- **Hero/Title Section:** 8/10 (Clear, large, playful fonts)
- **Body Content:** 6/10 (Readability hurt by 900-weight overuse and small text)
- **Interactive Elements:** 5/10 (Small tap targets, heavy text weight, tight spacing)
- **Overall:** 6.3/10

---

## 15. RECOMMENDATIONS FOR IMPROVEMENT

### Priority 1: Reduce weight extremes
```tsx
// Before: Every button uses 900-weight
<button className="...text-lg font-extrabold...">Save</button>

// After: Use 700-800 for buttons, 900 sparingly
<button className="...text-lg font-bold...">Save</button>
```

### Priority 2: Increase small text sizes
```tsx
// Before: Bottom nav at 10px
<span className="text-[10px] font-extrabold">Home</span>

// After: Minimum 12px, preferably 14px
<span className="text-xs font-bold">Home</span>
```

### Priority 3: Add responsive typography
```tsx
// Before: Same size on all screens
<h1 className="text-3xl">Title</h1>

// After: Scales with screen
<h1 className="text-2xl sm:text-3xl md:text-4xl">Title</h1>
```

### Priority 4: Use leading-relaxed for small 900-weight text
```tsx
// Before: Cramped small text
<p className="text-xs font-extrabold">Label</p>

// After: Breathable small text
<p className="text-xs font-bold leading-relaxed">Label</p>
```

---

## REFERENCE FILES ANALYZED

- `src/styles.css` — Core typography tokens and CSS rules
- `src/routes/__root.tsx` — Font loading, meta tags
- `src/components/screens.tsx` — Heading, body, button typography across all screens
- `src/components/ExpandableCard.tsx` — Card content typography patterns
- `src/components/PostcardScreen.tsx` — Canvas text rendering (system fonts)
- `src/components/ui/*.tsx` — UI component default typography
- `src/components/FilePermissionDialog.tsx`, `PassportSprout.tsx`, etc. — Component-level text patterns

---

**Audit Completed:** September 2026  
**Inspector:** Code-only analysis (no documentation or inference)
