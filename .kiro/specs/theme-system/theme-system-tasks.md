# Theme System: make India Explorer fully theme-aware

Save as `.kiro/specs/theme-system/tasks.md`. Branch: `develop`. Stack: Tailwind v4, React 19, TanStack Start (SPA), Capacitor 6 Android.

## Overview

This spec defines a complete theme system refactor to make India Explorer fully theme-aware. The system allows any visual style (Claymorphism, Clay Dark, Neobrutalism, Minimal Flat, etc.) to be added by writing a single theme file of tokens, with zero changes to screens or components. The implementation spans seven major phases: establishing a token foundation, building a themeable component layer, creating the theme engine, removing hardcoded styling in batches, adding a guard against future hardcoding, implementing multiple themes, and establishing per-theme quality gates.

## Goal

Any visual style (Claymorphism, Clay Dark, Neobrutalism, Minimal Flat, Neumorphism, Glassmorphism, Aurora Mesh, Material You, Cyber Neon, Skeuomorphism, and more later) can be added by writing ONE theme file of tokens, with ZERO changes to screens or components. Switching the theme restyles the whole app instantly, including the header, bottom nav, modals, celebration screens, status bar and the postcard canvas.

## Where we are (audit of `develop`, approximate counts in `src/`)

- 497 raw Tailwind palette classes (`bg-orange-500`, `text-gray-600`, `from-pink-400`...), 353 uses of `bg-white` / `text-white` / `bg-black` / `text-black`, 107 `bg-gradient-to-*`, 90 hex colours, 26 `rgb()/rgba()/hsl()` literals, 6 inline `style={{ color/background }}`, 36 canvas `fillStyle/strokeStyle` calls (postcard code), 200 `shadow-*` uses, only 6 `dark:` variants.
- Worst files: `screens.tsx` (about 328), `StandardModal.tsx` (68), `ParentZone.tsx` (34), `HomeScreen.tsx` (27), `Passport*.tsx` (24 each), `CardNarrationPlayer.tsx` (24), `__root.tsx` (22), `ParentGate.tsx` (21), `state-performance-badges-view.tsx` (20). `DebugScreen.tsx` and `AudioTestScreen.tsx` are dev-only: exclude them.
- A token foundation already exists: about 76 `--color-*` tokens in `src/styles.css` and `src/styles/tokens.css`, 71 `@utility` helpers (`text-muted`, `card`, `gradient-saffron`...), shadcn-style names (`background`, `card`, `primary`...). But components bypass it, and `tokens.css` and `styles.css` BOTH define fonts and colours (two sources of truth).
- The page background is a hardcoded gradient (`#f7f4ef` to `#eef2f8`, `src/styles.css` ~line 176). The default Clay look is hardcoded in `src/styles/clay.css` (77 `clay-*` usages). There is no theme store and no `data-theme`.
- Android: no `@capacitor/status-bar` plugin; `capacitor.config.ts` fixes `preferredStatusBarStyle: 'dark'`; `styles.xml` fixes the status bar colours. A dark theme would show dark icons on a dark bar.

## Global rules (apply to every task)

- Run ONE task at a time. Stop when done. Commit after each sub-task.
- Never use a raw colour, gradient, shadow, radius or font in a component. Components use semantic tokens only.
- Tailwind v4 syntax only: `p-(--padding-md)`, NOT `p-[--padding-md]` (the old form produces no CSS).
- Do not change the root `font-size`. Do not add Android permissions. No secrets in logs or commits.
- The DEFAULT theme (Claymorphism) must look the same as today after every task. Take screenshot baselines in T1 and compare after each batch.
- Kid-first limits for every theme: text contrast at least 4.5:1 (3:1 for 18px+ bold), body and label text at least 16px, touch targets at least 48px, no flashing or fast motion, `prefers-reduced-motion` respected.
- Report after each task: files changed, remaining hardcoded count, anything unsure. Do not create summary `.md`/`.txt` files in the repo root.

## Token contract (the ONLY things components may use)

| Group | Tokens (CSS variables) | Used for |
|---|---|---|
| Page | `--bg-page` (may be a gradient or mesh), `--bg-header` (hero/header gradient or solid), `--bg-nav`, `--nav-active-bg` | page, headers, bottom nav |
| Surfaces | `--surface-card`, `--surface-raised`, `--surface-sunken` (inputs, tracks), `--surface-overlay` (modals), `--scrim` | cards, modals, inputs |
| Text | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-header`, `--text-on-primary`, `--text-link` | all text |
| Actions | `--action-primary-bg/fg`, `--action-secondary-bg/fg`, `--action-success-bg/fg`, `--action-disabled-bg/fg` | buttons, chips |
| Accents | `--accent-1` to `--accent-6` plus `--accent-N-soft` and `--accent-N-ink` | region, topic and badge colours (replaces saffron, explorer, success, gold, gem, orange, purple) |
| Feedback | `--fb-success`, `--fb-warning`, `--fb-error`, `--fb-info` (each with `-bg`, `-fg`, `-border`) | quiz right/wrong, toasts |
| Progress | `--progress-track`, `--progress-fill`, `--progress-fill-2` | bars |
| Border | `--border-color`, `--border-width`, `--border-strong` | outlines (0 for clay, 3px for neobrutalism) |
| Effects | `--shadow-card`, `--shadow-raised`, `--shadow-button`, `--shadow-pressed`, `--shadow-inset`, `--blur-surface` (0 or a blur), `--glow` | depth, glass, neon |
| Shape | `--radius-card`, `--radius-button`, `--radius-chip`, `--radius-input`, `--radius-modal` | rounding |
| Type | `--font-display`, `--font-body`, `--font-display-weight`, `--letter-spacing-display` | fonts |
| Motion | `--press-offset` (neobrutalism moves 3px), `--press-scale`, `--transition-fast` | press feel |
| Media | `--illustration-plate` (a light plate behind transparent state art on dark themes), `--confetti-colors` (list) | art and celebrations |
| System | `--statusbar-style` (`light` or `dark`), `--statusbar-bg`, `--meta-theme-color`, `--is-dark` | status bar, browser chrome |

Tailwind mapping goes in ONE `@theme inline` block (for example `--color-surface-card: var(--surface-card)` gives `bg-surface-card`). Each theme is one file `src/styles/themes/<id>.css` with `[data-theme="<id>"] { ... }`. A registry `src/lib/themes.ts` holds `id`, `name`, `description`, `isDark`, `effects` (`blur`, `glow`, `heavy`), `previewTokens`.

Replacement map for the codemod (screens decide the exact token by role):
- `bg-white` to `bg-surface-card` (modals: `bg-surface-overlay`; inputs and tracks: `bg-surface-sunken`); `bg-black/NN` backdrops to `bg-scrim`.
- `text-white` to `text-on-header` / `text-on-primary` (by what it sits on); `text-gray-900/800` to `text-primary`; `text-gray-600/500` to `text-secondary`; `text-gray-400` to `text-muted`; `border-gray-*` to `border-default`.
- `bg-orange-*`, `from-orange-*`, `bg-saffron` to `bg-action-primary` or `bg-header`; `blue` to `accent-2` or `fb-info`; `green` to `accent-3` or `fb-success`; `red` to `fb-error`; `yellow/amber` to `accent-4` or `fb-warning`; `purple/violet/pink` to `accent-5` / `accent-6`.
- `bg-gradient-to-*` to `bg-header`, `bg-hero` or `bg-cta` (the theme decides gradient or solid). A gradient written in a component is a violation.
- Hex and `rgb()` in TypeScript (canvas, confetti, charts): read tokens at runtime with `readToken('--surface-card')` (a helper using `getComputedStyle(document.documentElement)`).

Allowed exceptions (put in an allowlist): theme files, content colours that are part of the artwork or identity (`avatar-config.ts` avatar backdrops, state illustration data), dev-only screens, third-party code.

## Tasks

- [ ] 1. Baseline and a single source of truth
  - [ ] 1.1 Screenshot baseline. Add `tests/e2e/theme-baseline.spec.ts`: 360x800 and 411x891 screenshots of Home, Journey, a state hub, a learning card, quiz question, quiz result, celebration, Postcard, Explore, Badges (both tabs), Me, Parent gate and Parent Zone. Store as the baseline. All later default-theme changes must match it (small anti-aliasing tolerance).
    - VERIFY: `npm run e2e` produces the baseline images.
  - [ ] 1.2 Remove the duplicate token definitions. Keep tokens in `src/styles/tokens.css` only (fonts, colours, radii, shadows); `src/styles.css` keeps `@theme inline`, `@utility` and base styles. Delete duplicates.
    - VERIFY: build passes; baseline screenshots unchanged.
  - [ ] 1.3 Create the token contract above in `src/styles/tokens.css` under `:root, [data-theme="clay"]` with values that reproduce TODAY's look exactly (read them from the current classes and `clay.css`). Add the Tailwind mapping block. Put the body background in `--bg-page`; remove the hardcoded gradient from `styles.css`.
    - VERIFY: baseline screenshots unchanged; compiled CSS contains `bg-surface-card`, `text-primary`, `bg-header`.
    - _Depends on: 1.2_

- [ ] 2. Themeable component layer
  - [ ] 2.1 Rename `clay-*` utilities (`clay-card`, `clay-button`, `clay-chip`, `clay-input`, colour variants) to `ui-card`, `ui-button`, `ui-chip`, `ui-input`, `ui-accent-1..6` (mechanical find/replace, about 77 usages). Rewrite `src/styles/clay.css` as `src/styles/ui.css`: every property reads a token (`--shadow-card`, `--radius-card`, `--border-width`, `--press-offset`...). Clay is now just values in `[data-theme="clay"]`.
    - VERIFY: baseline unchanged; `grep -r "clay-" src` finds only the theme file.
  - [ ] 2.2 Add the missing shared pieces as token-driven classes: `ui-header`, `ui-nav` (+ active pill), `ui-modal` + `ui-scrim`, `ui-progress` (track and fill), `ui-toggle`, `ui-badge`, `ui-tab`. Replace the implementations in `StandardModal.tsx`, `BottomNav`, `CardProgressBar.tsx`, tabs and toggles.
    - VERIFY: baseline unchanged.
    - _Depends on: 2.1_

- [ ] 3. Theme engine
  - [ ] 3.1 `src/lib/themes.ts` registry and `src/store/themeStore.ts` with Zod-validated persistence (`india-explorer:theme:v1`, default `clay`, an unknown id falls back to `clay`; never wipe other data). Apply `data-theme` and `color-scheme` on `<html>`.
  - [ ] 3.2 No flash on launch: set `data-theme` from localStorage in an inline script in the document head (via `__root.tsx` head and `wrap-html.mjs`) before first paint.
  - [ ] 3.3 Status bar and system chrome: add `@capacitor/status-bar` (v6); set style and background from `--statusbar-style` and `--statusbar-bg` on every theme change; update `<meta name="theme-color">`. Remove the fixed `preferredStatusBarStyle` from `capacitor.config.ts`. Keep the splash screen neutral and brand-coloured.
  - [ ] 3.4 Picker UI: in the Me tab add "My Style" opening a Themes screen with a 2-column grid of tiles (name, one-line description, live mini preview rendered from that theme's tokens, "Selected" tick). 48px+ targets, no parent gate. Do NOT add a sixth bottom-nav tab. The theme choice is never sent to analytics.
    - VERIFY: choose a theme, close and reopen the app, theme persists; no flash; status bar icons readable.
    - _Depends on: 1.3, 2.1_

- [ ] 4. Remove hardcoded styling (batches, in this order; baseline must stay identical after each)
  - [ ] 4.1 Shared UI: `StandardModal.tsx`, `ParentGate.tsx`, `ParentZone.tsx`, `GranularConsentDialog.tsx`, `ResetPINDialog.tsx`, `__root.tsx` (nav, toasts), `CardProgressBar.tsx`, `CardNarrationPlayer.tsx`.
  - [ ] 4.2 Home: `HomeScreen.tsx` and the Home section of `screens.tsx`.
  - [ ] 4.3 Journey, Explore (`PassportSprout/Sapling/MightyTree`), `JourneyDestinationCard.tsx`, `PostcardCard.tsx`, region tabs.
  - [ ] 4.4 Learning hub, learning cards, language toggle, quiz question and result screens (sections of `screens.tsx`).
  - [ ] 4.5 Badges (`state-performance-badges-view.tsx` and the achievement views), Me/Profile, avatar picker (avatar backdrops stay as content colours, but borders and text use tokens).
  - [ ] 4.6 Celebrations and postcards: "State Mastered" popup, "State Cleared" screen, achievement modal, confetti (read `--confetti-colors`), and the postcard canvas in `PostcardScreen/PreviewModal/Modal` (36 `fillStyle/strokeStyle` calls: read colours from tokens at draw time, redraw when the theme changes).
  - [ ] 4.7 Everything else still listed by the guard in T5 (except the allowlist). Replace every `bg-gradient-to-*` in components with `bg-header`, `bg-hero` or `bg-cta`.
  - For each sub-task: use the replacement map above, pick the token by ROLE (not by colour), then VERIFY: build and tests pass, baseline screenshots unchanged, the guard's violation count dropped (report the number).

- [ ] 5. Guard so hardcoding cannot come back
  - [ ] 5.1 `scripts/check-theme-tokens.mjs`: fail if `src/` (outside the allowlist) contains raw Tailwind palette classes, `bg-white|black`, `text-white|black`, `bg-gradient-to-*`, hex/`rgb()`/`hsl()` literals, inline `style` colours, `fillStyle` string literals, or v3-style `[--var]` classes. Keep a `scripts/theme-token-baseline.json` with current counts per file that may only go DOWN. Add to `npm run lint` and CI.
  - [ ] 5.2 Final state after T4: baseline is empty; the script fails on any new violation.
    - VERIFY: adding `bg-orange-500` to a component makes CI fail.
    - _Depends on: 4.1 to 4.7_

- [ ] 6. Add themes (tokens only; if a theme needs a component change, that is a missed hardcode: fix it in the component, not with a theme hack)
  - [ ] 6.1 Clay Dark (tests dark mode properly: `--is-dark`, light status bar icons, `--illustration-plate` behind transparent state art, light text, glow instead of dark shadows).
  - [ ] 6.2 Neobrutalism (3px ink borders, hard offset shadows, flat saturated fills, `--press-offset: 3px`, ink text only).
  - [ ] 6.3 Minimal Flat and Material You (soft pastel).
  - [ ] 6.4 Neumorphism.
  - [ ] 6.5 Aurora Mesh, Glassmorphism, Cyber Neon, Skeuomorphism: "heavy" themes. Rules: `backdrop-filter` only on header, nav and modals, never on list rows; solid fallback under `@supports not (backdrop-filter: blur(1px))` and under `prefers-reduced-transparency`; a limit of 3 blurred layers on screen; no animated gradients (static mesh); skeuomorphism may change `--font-body` but never below 16px.
  - [ ] 6.6 The remaining styles toward 19, one at a time.
  - For each theme VERIFY: axe `color-contrast` passes on every screen in the baseline list; screenshots saved; no horizontal scroll; the picker tile preview matches the real result.
  - _Depends on: 5.2_

- [ ] 7. Per-theme quality gates
  - [ ] 7.1 Extend the contrast and screenshot specs to run once per theme (theme x screens matrix). Fail on: contrast, overflow, element overlapping the bottom nav, text below 14px.
  - [ ] 7.2 Performance check on a low-end Android profile: record frame time while scrolling Journey and Badges for each heavy theme; fall back to the solid variant if it drops below 50 fps (document the result).
  - [ ] 7.3 Add a "How to add a theme" section to `docs/themes.md`: copy a theme file, set every token in the contract, register it, run the per-theme gates. Include the full token list.

## Definition of done

- `npm run lint` (includes the theme guard), `npm run test`, `npm run build` pass, and the screenshot and axe specs pass for every shipped theme.
- Adding `src/styles/themes/<new>.css` plus one registry entry produces a fully working, fully restyled theme with no other file touched.
- Grep for raw colours, gradients and arbitrary shadows in `src/` (outside the allowlist) returns nothing.
- The default Clay theme is visually unchanged from the T1 baseline.

## Out of scope

- Changing content, quiz logic, progress or Parent Zone behaviour.
- Recolouring the state illustrations or avatars (they use a plate on dark themes instead).
- Per-theme layout changes (themes change values, never structure).

# Implementation Plan

This plan follows a strict sequence to avoid breaking the default Clay theme. Each phase builds on the previous and includes verification steps against the T1 baseline.

**Phase 1 (Tasks 1–3):** Establish token foundation and theme engine
- Create screenshot baseline for regression testing
- Consolidate token sources and establish token contract
- Build theme store and persistence layer
- Implement status bar integration

**Phase 2 (Tasks 2 & 4.1–4.5):** Convert components to use tokens
- Rename and refactor clay utilities into token-driven UI classes
- Replace hardcoded styling in shared UI and screen components
- Verify baseline remains unchanged after each batch

**Phase 3 (Tasks 4.6–4.7 & 5):** Complete removal and enforce with guard
- Handle celebrations, postcards, and remaining hardcoded styling
- Implement token guard script to prevent regressions
- Verify no raw colours remain in source (outside allowlist)

**Phase 4 (Tasks 6–7):** Add themes and quality gates
- Implement multiple theme variants (dark, neobrutalism, etc.)
- Add contrast and screenshot verification per theme
- Document theme creation process

## Notes

- **Baseline protection:** All tasks after T1 must produce screenshots identical to the baseline (anti-aliasing tolerance allowed). This prevents accidental visual regressions while implementing the theme system.
- **Token-first approach:** Every visual property in a component must come from the token contract. Raw colours, gradients, shadows, or radii in components (outside the allowlist) are violations.
- **Android integration:** Status bar integration (T3.3) requires `@capacitor/status-bar` v6 and careful coordination with `capacitor.config.ts` and `styles.xml`.
- **Canvas challenge:** Postcard canvas (T4.6) requires reading token values at runtime via `readToken()` helper and redrawing on theme change. This is the most complex element to convert.
- **Performance considerations (T7.2):** Heavy themes (blur, glow, mesh) need validation on low-end Android to ensure 50+ fps during scroll. Fallback to solid variants if needed.
- **Accessibility:** Every theme must meet kid-first requirements: 4.5:1 contrast (3:1 for 18px+ bold), minimum 16px body text, 48px+ touch targets, no flashing/fast motion, `prefers-reduced-motion` respected.

## Task Dependency Graph

```
1.1 (Screenshot Baseline)
  ↓
1.2 (Consolidate Tokens)
  ↓
1.3 (Token Contract) ──→ 3.1 (Theme Store) ──→ 3.2 (No Flash) ──→ 3.3 (Status Bar)
  ↓                                                                        ↓
2.1 (Rename clay-*) ───────────────────────────────────────→ 3.4 (Picker UI)
  ↓
2.2 (UI Classes)
  ↓
4.1 (Shared UI) → 4.2 (Home) → 4.3 (Journey/Explore) → 4.4 (Learning) → 4.5 (Badges) → 4.6 (Celebrations) → 4.7 (Remaining)
  ↓                                                                                                           ↓
5.1 (Guard Script) ─────────────────────────────────────────────────────────────────────────────────→ 5.2 (Final Verification)
  ↓
6.1 (Clay Dark) → 6.2 (Neobrutalism) → 6.3 (Minimal Flat/Material You) → 6.4 (Neumorphism) → 6.5 (Heavy Themes) → 6.6 (Additional Themes)
  ↓                                                                                                                    ↓
7.1 (Per-Theme Specs) → 7.2 (Performance) → 7.3 (Documentation)

Critical Path:
1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 3.4 → 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7 → 5.1 → 5.2 → 6.1 → 7.1 → 7.3

Parallel Opportunities:
- 3.1, 3.2, 3.3 can proceed in parallel once 1.3 is complete
- Theme implementations (6.x) can proceed in parallel once 5.2 passes
```
