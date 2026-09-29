# Phase 4.4: Typography System Implementation Guide

## Overview

The typography system establishes consistent font sizing, line heights, and weights across India Explorer. This system is optimized for kids (ages 3-12) with larger base sizes and generous line heights for easy reading.

**Key Principle:** Kids apps require LARGER text than standard web apps. Minimum 14px for body text, 16px for interactive elements.

---

## Font Families (Already Defined in Tokens)

```css
--font-display: "Baloo 2", system-ui, sans-serif;  /* Headers, emphasis */
--font-sans: "Nunito", system-ui, sans-serif;      /* Body text, UI */
```

### Why these fonts?

- **Baloo 2:** Playful, rounded, easy to read. Great for kids content. Bold weights (700-800) work well for emphasis.
- **Nunito:** Friendly, readable body font. Excellent metrics for accessibility and readability at small sizes.

---

## Type Scale (Complete Hierarchy)

### Display Sizes (Primary Hierarchy)

| Class | Size | Line Height | Weight | Use Case | Example |
|-------|------|-------------|--------|----------|---------|
| `.text-h1` | 2rem (32px) | 1.2 | 800 (extrabold) | Page titles, screen titles | "India Explorer", "Home" |
| `.text-h2` | 1.5rem (24px) | 1.2 | 800 (extrabold) | Section headers | "Your Progress", "Badges" |
| `.text-h3` | 1.25rem (20px) | 1.375 | 700 (bold) | Subsection headers | "Recently Played", "Milestones" |
| `.text-h4` | 1.125rem (18px) | 1.375 | 700 (bold) | Component titles | Card titles, modal headers |
| `.text-h5` | 1rem (16px) | 1.5 | 600 (semibold) | Emphasis text | Stat labels, button text |

**CSS:**

```css
.text-h1 {
  font-family: var(--font-display);
  font-size: var(--font-size-h1);           /* 2rem / 32px */
  font-weight: var(--font-weight-extrabold); /* 800 */
  line-height: var(--line-height-tight);     /* 1.2 */
  letter-spacing: var(--letter-spacing-tight); /* -0.01em */
}
```

### Body Text Sizes (Content Hierarchy)

| Class | Size | Line Height | Weight | Use Case | Example |
|-------|------|-------------|--------|----------|---------|
| `.text-body-lg` | 1.125rem (18px) | 1.5 | 400 (normal) | Large body text | Card descriptions |
| `.text-body` | 1rem (16px) | 1.5 | 400 (normal) | Primary body text | Main content, quiz questions |
| `.text-body-sm` | 0.875rem (14px) | 1.5 | 400 (normal) | Secondary body text | Card subtitles, hints |
| `.text-label` | 0.875rem (14px) | 1.375 | 700 (bold) | Form labels, captions | "Your Name", "Age" |
| `.text-caption` | 0.75rem (12px) | 1.5 | 400 (normal) | Small text, metadata | "Last played: 2d ago" |

**CSS:**

```css
.text-body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);         /* 1rem / 16px */
  line-height: var(--line-height-normal);   /* 1.5 */
  font-weight: var(--font-weight-normal);   /* 400 */
}
```

---

## Line Heights (Readability for Kids)

Larger line heights improve readability, especially for younger children.

```css
--line-height-tight: 1.2;      /* Headers (tighter) */
--line-height-snug: 1.375;     /* Smaller text (balanced) */
--line-height-normal: 1.5;     /* Body text (airy) ← MOST USED */
--line-height-relaxed: 1.625;  /* Large text (very airy) */
--line-height-loose: 1.75;     /* Captions (maximum space) */
```

**Rationale:**

- Kids benefit from extra space between lines (more than typical web content)
- 1.5 is ideal for 16px body text (gives 24px of space)
- Larger line height = easier eye tracking across lines
- WCAG recommends 1.5x for dyslexia-friendly text

---

## Font Weights (Visual Hierarchy)

```css
--font-weight-thin: 100;        /* Rarely used */
--font-weight-light: 300;       /* Subtle emphasis */
--font-weight-normal: 400;      /* Body text (default) */
--font-weight-medium: 500;      /* Slight emphasis */
--font-weight-semibold: 600;    /* UI labels, buttons */
--font-weight-bold: 700;        /* Headers, emphasis */
--font-weight-extrabold: 800;   /* Display text, h1/h2 */
```

**Usage:**

- `400` (normal): All body text, paragraphs
- `600-700` (semibold/bold): Button labels, form labels, card titles
- `800` (extrabold): Page titles (h1/h2), emphasis

**Avoid:**

- `100-300` (thin/light): Hard to read at small sizes, especially on mobile
- `900` (black): Too heavy, only for special emphasis

---

## Complete Type Scale Reference

### h1 (Page Title)

```tsx
<h1 className="text-h1">India Explorer</h1>

// Result: 32px, 800 weight, 1.2 line-height, -0.01em letter-spacing
```

### h2 (Section Title)

```tsx
<h2 className="text-h2">Your Progress</h2>

// Result: 24px, 800 weight, 1.2 line-height, -0.01em letter-spacing
```

### h3 (Subsection)

```tsx
<h3 className="text-h3">Recently Played</h3>

// Result: 20px, 700 weight, 1.375 line-height
```

### Body Text (Primary)

```tsx
<p className="text-body">Complete challenges to earn badges and discover India!</p>

// Result: 16px, 400 weight, 1.5 line-height
```

### Body Text (Large)

```tsx
<p className="text-body-lg">This is a larger, more prominent paragraph.</p>

// Result: 18px, 400 weight, 1.5 line-height
```

### Body Text (Small)

```tsx
<p className="text-body-sm">Secondary text, descriptions, hints</p>

// Result: 14px, 400 weight, 1.5 line-height
```

### Label (Form Input)

```tsx
<label className="text-label">Your Name</label>

// Result: 14px, 700 weight, 1.375 line-height
```

### Caption (Small Metadata)

```tsx
<p className="text-caption">Last played: 2 days ago</p>

// Result: 12px, 400 weight, 1.5 line-height
```

---

## Letter Spacing (Hierarchy & Readability)

Letter spacing improves readability for display text but can hurt it for body text.

```css
--letter-spacing-tighter: -0.02em;  /* Very tight (headers only) */
--letter-spacing-tight: -0.01em;    /* Tight (h1, h2, display) */
--letter-spacing-normal: 0em;       /* Default (body text) ← MOST USED */
--letter-spacing-wide: 0.025em;     /* Wide (labels, emphasis) */
--letter-spacing-wider: 0.05em;     /* Wider (all-caps labels) */
```

**Usage:**

- `-0.01em` (tight): Display text, h1/h2 - makes them feel more cohesive
- `0em` (normal): Body text, all other text - optimal readability
- `0.025em` (wide): Form labels, buttons - subtle emphasis
- `0.05em` (wider): All-caps text like "NEXT" or "SUBMIT" - improves spacing

---

## Responsive Typography (Mobile-First)

All sizes are already optimized for mobile (16px base). **Do NOT change font sizes on larger screens** - kids use primarily mobile/tablets.

- Base unit: 16px (defined in browser default)
- 1rem = 16px
- 2rem = 32px
- 1.5rem = 24px
- etc.

---

## Implementation in Components

### Semantic HTML (Always Use Heading Elements)

```tsx
// ✅ CORRECT - Semantic HTML
<h1 className="text-h1">Page Title</h1>
<h2 className="text-h2">Section Title</h2>
<h3 className="text-h3">Subsection</h3>
<p className="text-body">Body content</p>

// ❌ WRONG - Non-semantic
<div className="text-h1">Page Title</div>  // Missing semantics
<div className="text-display text-lg font-extrabold">Section</div> // Inconsistent
```

### Button Text (Always Use text-body or text-label)

```tsx
// ✅ CORRECT
<button className="text-body font-bold">Continue</button>
<button className="text-label">Submit</button>

// ❌ WRONG
<button className="text-xs">Continue</button>  // Too small for button
<button style={{ fontSize: '10px' }}>Continue</button>  // Inaccessible
```

### Card Titles (Always Use text-h4 or text-h5)

```tsx
// ✅ CORRECT
<div className="rounded-lg p-4">
  <h3 className="text-h4">Recent Achievement</h3>
  <p className="text-body-sm text-muted-foreground">Unlocked 3 days ago</p>
</div>

// ❌ WRONG
<div className="rounded-lg p-4">
  <div className="text-sm font-bold">Recent Achievement</div>  // Too small
  <div className="text-xs text-gray-500">Unlocked 3 days ago</div>  // Size not token
</div>
```

### Quiz Questions (Always Use text-body or text-body-lg)

```tsx
// ✅ CORRECT - Easy to read
<div className="text-body-lg font-semibold leading-relaxed">
  Which state is known for its deserts?
</div>

// ❌ WRONG - Too small for kids
<div className="text-sm">Which state is known for its deserts?</div>
```

---

## Minimum Font Sizes by Component

| Component | Minimum Size | Reason |
|-----------|--------------|--------|
| Body text | 14px | WCAG requires readability |
| Button labels | 16px | Kids need larger tap targets |
| Form inputs | 16px | Prevents mobile zoom on focus |
| Interactive labels | 14px | Forms, toggles |
| Captions/metadata | 12px | Context text only |
| Disabled text | 12px-14px | Acceptable for non-interactive |

**Never use:**

- Text smaller than 12px for regular content
- Text smaller than 14px for interactive elements
- Text smaller than 16px for buttons (causes mobile zoom)

---

## Usage Patterns in Code

### Pattern 1: Page Layout (Heading Hierarchy)

```tsx
export function MyScreen() {
  return (
    <div>
      {/* H1: Main page title */}
      <h1 className="text-h1">Learning Hub</h1>
      
      {/* H2: Section headers */}
      <h2 className="text-h2">Featured Lessons</h2>
      
      {/* H3: Subsections */}
      <h3 className="text-h3">Popular Today</h3>
      
      {/* Body text for descriptions */}
      <p className="text-body">
        Discover amazing facts about Indian states.
      </p>
      
      {/* Small text for metadata */}
      <p className="text-caption text-muted-foreground">
        Last updated: Today
      </p>
    </div>
  );
}
```

### Pattern 2: Card Component

```tsx
export function Card({ title, description, metadata }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-soft">
      {/* Card title: h4 size */}
      <h4 className="text-h4 mb-2">{title}</h4>
      
      {/* Card description: body text */}
      <p className="text-body mb-3 text-muted-foreground">
        {description}
      </p>
      
      {/* Metadata: small caption */}
      <p className="text-caption text-muted-foreground">
        {metadata}
      </p>
    </div>
  );
}
```

### Pattern 3: Form

```tsx
export function Form() {
  return (
    <form>
      {/* Form label: use text-label */}
      <label htmlFor="name" className="text-label block mb-2">
        Your Name
      </label>
      
      {/* Form input: 16px minimum */}
      <input
        id="name"
        className="text-body border rounded-lg p-3 w-full"
        placeholder="Enter your name"
      />
      
      {/* Help text: use text-body-sm */}
      <p className="text-body-sm text-muted-foreground mt-1">
        This will be displayed on your profile.
      </p>
      
      {/* Button: use text-body or text-label */}
      <button className="text-body font-bold mt-4">
        Continue
      </button>
    </form>
  );
}
```

### Pattern 4: Quiz Question (Large Text for Kids)

```tsx
export function QuizQuestion({ question, options }) {
  return (
    <div>
      {/* Question: large, readable */}
      <h2 className="text-body-lg font-semibold leading-relaxed mb-6">
        {question}
      </h2>
      
      {/* Options: each is a button with readable text */}
      <div className="space-y-3">
        {options.map(option => (
          <button
            key={option}
            className="text-body font-semibold w-full p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-saffron active:scale-95 transition"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Accessibility Considerations

### WCAG 2.1 Compliance

✅ Minimum font sizes: 14px for body text (exceeds 12px minimum)  
✅ Line height: 1.5+ for body text (exceeds 1.5x requirement)  
✅ Letter spacing: Default for body text (no reduction)  
✅ Color contrast: Already verified in Phase 4.3 (4.5:1 minimum)  

### Dyslexia-Friendly Typography

India Explorer uses dyslexia-friendly practices:

✅ Good font choice: Nunito (sans-serif, friendly)  
✅ Adequate spacing: 1.5 line-height for body text  
✅ Large size: 16px base (exceeds 14px recommendation)  
✅ Letter spacing: Normal for body text (no spacing issues)  

### Kids-Friendly Considerations

✅ Playful display font: Baloo 2 (rounded, friendly)  
✅ Large sizes: All text > 12px  
✅ High contrast: 4.5:1 minimum (verified in Phase 4.3)  
✅ Clear hierarchy: h1-h3 clearly distinct from body  

---

## Files to Update (Implementation Checklist)

### Already Updated (Tokens Defined)

- ✅ `tokens.css` - All type scale tokens defined
- ✅ `design-tokens.ts` - TypeScript token definitions

### To Update (Component Usage)

- [ ] `screens.tsx` - Apply `.text-h2`, `.text-body`, etc.
- [ ] `CardProgressBar.tsx` - Use text-label for labels
- [ ] `DailyGoalCard.tsx` - Use text-body-sm for captions
- [ ] `src/components/*.tsx` - All components (forms, buttons, cards)
- [ ] Remove inline text-xs, text-sm, text-lg - use token classes instead

---

## Verification Steps

- [ ] All text uses defined token classes (`.text-h1`, `.text-body`, etc.)
- [ ] No hardcoded font sizes (no `text-[14px]`, `text-xs`, etc.)
- [ ] All semantic HTML elements have proper heading levels
- [ ] Minimum 14px for body text, 16px for buttons
- [ ] Line height 1.5+ for all body text
- [ ] Build succeeds with `npm run build`

---

## Summary

### The Kids-Optimized Type Scale:

```
h1:        32px (2rem) - Baloo 2, 800, 1.2 lh
h2:        24px (1.5rem) - Baloo 2, 800, 1.2 lh
h3:        20px (1.25rem) - Baloo 2, 700, 1.375 lh
h4:        18px (1.125rem) - Baloo 2, 700, 1.375 lh
h5:        16px (1rem) - Nunito, 600, 1.5 lh

Body (lg): 18px (1.125rem) - Nunito, 400, 1.5 lh
Body:      16px (1rem) - Nunito, 400, 1.5 lh ← DEFAULT
Body (sm): 14px (0.875rem) - Nunito, 400, 1.5 lh

Label:     14px (0.875rem) - Nunito, 700, 1.375 lh
Caption:   12px (0.75rem) - Nunito, 400, 1.5 lh
```

### Key Principles:

✅ Larger than standard web - Optimized for kids (3-12 years)  
✅ Generous line heights - 1.5+ for easy reading  
✅ Clear hierarchy - Headers vs body vs captions obvious at a glance  
✅ Always semantic - Use `<h1>`-`<h3>`, `<p>`, never plain `<div>`  
✅ Token-based - Use CSS token classes, never hardcoded sizes  

---

## Next Steps (Phase 4.5)

After typography is locked in:

1. Apply these classes to all components
2. Remove hardcoded font sizes throughout codebase
3. Update all inline styles to use design tokens
4. Verify visual consistency across screens
5. Test with actual users (kids) for readability

---

## References

- [WCAG 2.1 Contrast: Level AA = 4.5:1](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum) ✅
- [WCAG 2.1 Text Spacing: 1.5x line-height recommended](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing) ✅
- Kids Typography: Larger sizes, generous spacing, friendly fonts ✅
- Dyslexia-Friendly: Sans-serif, adequate spacing, good contrast ✅

---

**Status:** Phase 4.4 Guide Created (Referenced from Design Token System)  
**Build Status:** ✅ PASS  
**Ready for Implementation:** Yes
