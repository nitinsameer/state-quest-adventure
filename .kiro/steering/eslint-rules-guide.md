# ESLint Rules: Hardcoded Emoji & Colors Prevention

## Overview
Two custom ESLint rules prevent developers from accidentally re-introducing hardcoded emoji and color values, which previously bypassed the centralized design token system.

## Rules

### 1. `no-hardcoded-emoji/no-hardcoded-emoji`
**Purpose:** Prevent hardcoded emoji literals in JSX attribute values and object properties.

**Affected Contexts:**
- JSX attribute values: `<Component icon="🏠" />`
- Object properties with `icon` or `emoji` keys: `{ icon: "🎯", label: "Achievement" }`

**Error Message:**
```
Hardcoded emoji found: '🏠'. Use EMOJI constants from 'src/constants/emoji.ts' instead. Example: EMOJI.nav.home
```

**Fix:**
Replace hardcoded emoji with imported constants from `src/constants/emoji.ts`:

```javascript
// ❌ Before
<NavItem icon="🏠" label="Home" />

// ✅ After
import { EMOJI } from "@/constants/emoji";

<NavItem icon={EMOJI.nav.home} label="Home" />
```

**Common Mappings:**
- `🏠` → `EMOJI.nav.home`
- `🗺️` → `EMOJI.nav.explorer`
- `📍` → `EMOJI.nav.journey`
- `🎯` → `EMOJI.achievement`
- `🏆` → `EMOJI.trophy`
- `⭐` → `EMOJI.star`
- `👶` → `EMOJI.ageBand.baby`

See `src/constants/emoji.ts` for all available constants.

---

### 2. `no-hardcoded-colors/no-hardcoded-colors`
**Purpose:** Prevent hardcoded color values in inline style objects, requiring use of CSS token variables.

**Affected Contexts:**
- Inline style objects: `style={{ backgroundColor: "#fff" }}`
- Color-related CSS properties: `color`, `backgroundColor`, `borderColor`, `fill`, `stroke`, `outlineColor`

**Supported Color Formats (all flagged):**
- Hex: `#fff`, `#ffffff`
- RGB/RGBA: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- HSL/HSLA: `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)`
- OKLCH: `oklch(0.5 0.1 120)`, `oklch(0.5 0.1 120 / 0.8)`

**Error Message:**
```
Hardcoded color found: '#fff'. Use CSS token variables instead. Example: var(--color-primary) or var(--color-surface-primary). See src/styles/tokens.css for available tokens.
```

**Fix:**
Replace hardcoded colors with CSS token variables:

```javascript
// ❌ Before
<div style={{ backgroundColor: "#ffffff", color: "#000" }}>

// ✅ After
<div style={{ backgroundColor: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
```

**Available Token Categories:**
See `src/styles/tokens.css` for complete list. Common categories:
- `--color-primary`, `--color-secondary`
- `--color-surface-primary`, `--color-surface-secondary`
- `--color-text-primary`, `--color-text-secondary`
- `--color-border`, `--color-border-subtle`
- Theme-specific: `--color-accent-active`, `--color-accent-inactive`

---

## Severity
Both rules are set to **error** level and will:
- Block ESLint from passing (`npm run lint` will fail)
- Prevent commits if husky pre-commit hooks are configured
- Appear in your IDE as red squiggles

## Configuration
Rules are defined in:
- **Rule implementations:** `eslint-rules/no-hardcoded-emoji.js`, `eslint-rules/no-hardcoded-colors.js`
- **ESLint config:** `eslint.config.js`

To modify rule severity or configuration, edit `eslint.config.js`:

```javascript
rules: {
  "no-hardcoded-emoji/no-hardcoded-emoji": "error",  // Change to "warn" for warnings only
  "no-hardcoded-colors/no-hardcoded-colors": "error", // Change to "warn" for warnings only
}
```

## Running ESLint

```bash
# Run full lint
npm run lint

# Run ESLint only
npx eslint .

# Run ESLint on specific file
npx eslint src/components/screens.tsx

# Auto-fix (only works for some issues)
npm run lint:fix
```

## Tips

1. **Import emoji once at the top of a file** to avoid repetitive imports:
   ```javascript
   import { EMOJI } from "@/constants/emoji";
   
   export const NavItems = [
     { icon: EMOJI.nav.home, label: "Home" },
     { icon: EMOJI.nav.explorer, label: "Explorer" },
   ];
   ```

2. **Add new emoji to constants** if you need an emoji that's not in `src/constants/emoji.ts`:
   ```javascript
   // Add to EMOJI constant in src/constants/emoji.ts
   feedback: {
     success: "✅",
     error: "❌",
   },
   
   // Then use it
   <Icon>{EMOJI.feedback.success}</Icon>
   ```

3. **Use CSS tokens across all themes** — the centralized token system ensures consistent colors across theme variants (clay, material-you, festival, etc.).

4. **Check existing patterns** before adding new styles — look at `src/components` for examples of proper emoji and color usage.

## Troubleshooting

**Rule detects false positives in comments?**
- The rules specifically target JSX attributes and object properties. Comments are not flagged. If you see unexpected errors, verify the context is JSX/component code.

**Need to override a rule?**
- For a specific line: `// eslint-disable-next-line no-hardcoded-emoji/no-hardcoded-emoji`
- For entire file: `/* eslint-disable no-hardcoded-emoji/no-hardcoded-emoji */` at top
- But first consider: Is this truly an exception, or should the value be a constant?

**Rule not catching something?**
- Ensure the emoji/color is in a **JSX attribute** or **object property** context.
- Check that the component file has `.tsx` or `.ts` extension (rules only run on TypeScript files).
- Run `npm run lint` to verify ESLint is executing.

## Related Resources
- `src/constants/emoji.ts` — All centralized emoji constants
- `src/styles/tokens.css` — All CSS token variable definitions
- `.agents/tasks/theme-emoji-audit.md` — Original audit identifying hardcoded issues
- `eslint-rules/` — Custom rule implementations
