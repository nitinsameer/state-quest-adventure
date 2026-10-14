# Theme fixes v2: repair, token layer, picker, starter themes

Save as `.kiro/specs/theme-fixes/tasks.md` (replaces the earlier `theme-fixes-tasks.md`). Branch: `develop` at `38d8a93` or later.

## What was verified on `develop`

Good: the theme guard reports zero hardcoded colours, 230 unit tests pass, and six themes exist (`clay`, `clay-dark`, `neobrutalism`, `minimal-flat`, `material-you`, `neumorphism`) in `src/lib/themes.ts` and `src/styles/themes/`.

Broken:

1. **Garbled text.** Commit `704faec` ("T2.1 rename clay-* to ui-*") rewrote files with the wrong encoding: 317 garbled sequences in 10 files (`screens.tsx` 213, `QuizCeremony.tsx` 22, `PostcardModal.tsx` 17, `PostcardScreen.tsx` 16, `JourneyDestinationCard.tsx` 12, `PostcardPreviewModal.tsx` 12, `state-performance-badge-modal.tsx` 10, `state-performance-badges-view.tsx` 8, `PassportSeedling.tsx` 4, `LanguageToggle.tsx` 3). `scripts/fix-mojibake.mjs` repaired all 317 on a copy of this code; a second run found 0.
2. **Home header has no background.** `bg-bg-header` compiles to `background-color: var(--bg-header)`, but `--bg-header` is a gradient, so the declaration is invalid and the white header text sits on the page. 12 usages of `bg-bg-header` / `bg-bg-page` have this problem.
3. **Legacy colour tokens were deleted but are still used.** `--ink`, `--saffron`, `--saffron-soft`, `--explorer`, `--explorer-soft`, `--success`, `--success-soft`, `--gold`, `--gold-soft`, `--sky` had definitions in `src/styles.css` (lines 155 to 170 in commit `45cf648`) and now have none, but the `@theme inline` block still maps them. Result: `text-ink` (128 uses), `bg-success` (25), `text-saffron` (6), `text-explorer`, `bg-explorer` and `--color-text-primary: var(--ink)` (`styles.css` ~line 172) compile to invalid colours.
4. **Other undefined tokens used in production code:** `--space-0-25` (margins vanish in `CardNarrationPlayer`, `CardProgressBar`, `FirstSessionTutorial`), `--gap-md`, `--gap-xs`, `--surface-muted`, `--surface-subtle`, `--border-default`, `--action-primary-hover` (dialogs in `ParentGate`, `ParentZone`, `StandardModal` lose backgrounds and borders), `--fb-error-soft`, `--action-primary`, `--bg-overlay`, `--blur-overlay`. `scripts/check-undefined-tokens.mjs` (provided) lists 22.
5. **14 TypeScript errors:** `CelebrationPopup.tsx:63`, `PostcardPreviewModal.tsx:303`, `QuizCeremony.tsx:661`, `screens.tsx:589` and `:594` (reads `xp` and `badges`, which are not on `PendingCelebration` any more), and `__tests__/progress-ceremony.test.ts`.
6. **There is no way to change the theme in the app.** No picker, no `themeStore.ts`, and nothing sets `data-theme` on launch (only a watcher in `src/lib/theme-tokens.ts` reads it).

## Global rules (apply to every task)

- Run ONE task at a time, commit after each, report: files changed, anything unsure.
- **Encoding rule:** all scripts and codemods read and write UTF-8 explicitly (`fs.readFileSync(f, 'utf8')`). Never PowerShell `Get-Content`/`Set-Content` without `-Encoding utf8`; never `latin1`.
- Tailwind v4 syntax; a gradient may only be used with `background:` (never `background-color`, never inside a `--color-*` token).
- The default theme (Clay) must match the baseline screenshots, except for deliberate accessibility improvements that you list.
- Kid limits for every theme: text contrast at least 4.5:1 (3:1 for 18px+ bold), controls separable from the page by at least 3:1 (border or shadow), text at least 16px, tap targets at least 48px.
- No summary files in the repo root.

## Tasks

- [ ] 1. Repair the garbled characters
  - [ ] 1.1 Add `scripts/fix-mojibake.mjs`. Run `node scripts/fix-mojibake.mjs` (dry run, expect 317 in 10 files), then `--write`, then the dry run again (expect 0). Review `git diff`: only emoji and symbols (`·`, `—`, `✓`, `▶`) may change.
  - [ ] 1.2 Find and fix the tool that caused it (the codemod used in T2.1): it must read and write UTF-8.
  - [ ] 1.3 Add `.editorconfig` (`charset = utf-8`), `.gitattributes` (`* text=auto eol=lf`), and `scripts/check-encoding.mjs` (fails if any source file contains `ðŸ`, `â€`, `Â·`, `â–`, `âœ`, `âš`). Add it to `npm run lint` and CI.
  - [ ] 1.4 After `npm run build` and `npx cap sync android`, confirm `android/app/src/main/assets/public` has no `ðŸ` and does contain real emoji.
  - VERIFY: the bottom nav icons, Home, Explore and Me show correct emoji on the phone.

- [ ] 2. Repair the token layer (order matters)
  - [ ] 2.1 Stop the bleeding: re-add the legacy tokens to `src/styles/tokens.css` under `:root, [data-theme="clay"]` with their ORIGINAL values from `git show 45cf648:src/styles.css` (lines 155 to 170: `--ink`, `--saffron`, `--saffron-soft`, `--explorer`, `--explorer-soft`, `--success`, `--success-soft`, `--gold`, `--gold-soft`, `--sky`). Mark them `/* legacy, remove in 2.5 */`.
  - [ ] 2.2 Define the other missing tokens in the default theme AND every theme file (dark themes get dark equivalents): `--space-0-25: 0.25rem`, `--gap-xs`, `--gap-md`, `--surface-muted`, `--surface-subtle`, `--border-default`, `--action-primary` and `--action-primary-hover`, `--fb-error-soft`, `--bg-overlay`, `--blur-overlay`. Take light-theme values from the pre-theme look.
  - [ ] 2.3 Gradient backgrounds: add `@utility bg-header { background: var(--bg-header); }`, `bg-page`, `bg-hero`; replace the 12 `bg-bg-header` / `bg-bg-page` usages. Add a unit test that no `--color-*` token resolves to a gradient.
  - [ ] 2.4 Add `scripts/check-undefined-tokens.mjs` (provided) to `npm run lint` and CI. It must report OK after 2.1 to 2.3. (Runtime-set variables such as `--nav-h` are handled by its allowlist and `setProperty` detection.)
  - [ ] 2.5 Migrate the legacy classes by ROLE, then delete the legacy tokens: `text-ink` (128): on a button or chip fill, remove it (the `ui-button` / `ui-chip` classes set `--action-*-fg`); on a surface, `text-primary`; on a header, `text-on-header`. `bg-success` / `text-success` to `fb-success` tokens; `text-saffron` to `text-link` or `text-accent-1`; `bg-explorer` / `text-explorer` to `accent-2`. Do it in batches, check Clay Dark after each batch (ink on a dark surface must become light). When the guard shows 0 uses, delete the legacy tokens and the matching `@theme inline` lines.
  - [ ] 2.6 Home header: `--text-on-header` for Clay must reach 4.5:1 on the header gradient (use ink, about 6:1 on the orange) or be 24px+ bold at 3:1 with a text shadow-free solid. The header must not overlap the Journey card (header `shrink-0`).
  - [ ] 2.7 Explore: page background `--bg-page`; region tabs: selected = filled `ui-button ui-accent-1`, unselected = `ui-button ui-white`, with a second cue besides colour (bold label or a tick).
  - [ ] 2.8 Fix the 14 TypeScript errors listed above. In `screens.tsx` ~589 to 594 (Home celebration popup) use the real `PendingCelebration` fields (`quizXp`, `bonusXp`, `earnedBadgeIds`, `stars`), never typed-in numbers.
  - [ ] 2.9 Compare every baseline screenshot with the default theme; list and fix or explicitly accept each difference.
  - VERIFY: `check-undefined-tokens` OK, `tsc` 0 errors, tests pass, baseline matches.
  - _Depends on: 1_

- [ ] 3. Theme store and picker (this does not exist yet)
  - [ ] 3.1 `src/store/themeStore.ts`: Zod-validated persistence (`india-explorer:theme:v1`, default `clay`, unknown id falls back to `clay`, never touches other data). Apply `data-theme` and `color-scheme` on `<html>`.
  - [ ] 3.2 No flash on launch: set `data-theme` from localStorage in an inline head script (`__root.tsx` head and `wrap-html.mjs`, written as UTF-8).
  - [ ] 3.3 Status bar: add `@capacitor/status-bar` (v6); set style and colour from `--statusbar-style` and `--statusbar-bg` on every change; update `<meta name="theme-color">`; remove the fixed `preferredStatusBarStyle` from `capacitor.config.ts`.
  - [ ] 3.4 Me tab: a "My Style 🎨" row directly under "Change Avatar" (same card style), showing the current theme name and three colour dots. It opens a Themes screen (two taps from anywhere): a 2-column grid of tiles with a LIVE preview built from that theme's tokens (mini card, "Aa" field, "Play" button), name, one-line description, and a tick on the selected one. Tap applies instantly. 48px+ targets, no parent gate. The choice is never sent to analytics. Add `hidden?: boolean` to the registry; hidden themes are not listed.
  - VERIFY: choose a theme, close and reopen the app: it persists, no flash, status bar icons readable.
  - _Depends on: 2_

- [ ] 4. Starter set: five themes
  - [ ] 4.1 List in the picker: **Clay** (default), **Clay Dark**, **Neobrutalism**, **Minimal Flat**, and the new **Festival**. Set `hidden: true` on **Material You** and **Neumorphism** until they pass the per-theme gates in task 5 (neumorphism often fails contrast).
  - [ ] 4.2 Add `src/styles/themes/festival.css` (vivid, rangoli-inspired, matches India's colours) and register it:
    ```css
    [data-theme="festival"] {
      --bg-page: radial-gradient(#FF8A3D26 2px, #0000 2.4px) 0 0 / 26px 26px, #FFF6E5;
      --bg-header: linear-gradient(120deg, #FF8A3D, #FF6FB1 55%, #B388FF); --text-on-header: #131A33;
      --surface-card: #FFFFFF; --text-primary: #131A33; --text-secondary: #4A5168;
      --action-primary-bg: #FF6FB1; --action-primary-fg: #131A33;
      --action-secondary-bg: #FFD23F; --action-secondary-fg: #131A33;
      --accent-1: #FF8A3D; --accent-2: #4DA3FF; --accent-3: #3DDC84;
      --accent-4: #FFD23F; --accent-5: #B388FF; --accent-6: #FF6FB1;
      --border-strong: 2px solid #131A33;   /* pink on cream is only 2.4:1, so buttons need an outline */
      --shadow-card: 0 10px 22px -12px rgb(176 74 14 / .45); --shadow-button: 0 4px 0 #131A33;
      --radius-card: 24px; --radius-button: 20px;
      --statusbar-style: dark; --statusbar-bg: #FF8A3D;
    }
    ```
    Static pattern only, no animation. Define every token from the contract that this block does not set (fall back to the Clay values).
  - [ ] 4.3 Dark theme rules (Clay Dark): state art sits on `--illustration-plate`; light status bar icons; `text-primary` is light on surfaces and dark only on bright action fills.
  - VERIFY per theme: axe `color-contrast` passes on every baseline screen, screenshots saved, no horizontal scroll, the picker preview matches the real result.
  - _Depends on: 3_

- [ ] 5. Gates so this cannot regress
  - [ ] 5.1 CI runs `check-encoding`, `check-undefined-tokens`, the theme guard, `tsc`, and the contrast and screenshot specs once per listed theme.
  - [ ] 5.2 Visual diff of the default theme against the baseline.
  - [ ] 5.3 When Material You and Neumorphism pass the gates, remove `hidden: true`.
  - VERIFY: reintroducing a garbled character, an undefined token, or a gradient in a colour token fails CI.

## Definition of done

- No garbled characters; the Home header is readable; ink text is ink again everywhere.
- Me, then My Style, lists five themes with live previews; the choice persists; the status bar follows it.
- Every listed theme passes contrast and screenshot checks; the default look matches the baseline.
