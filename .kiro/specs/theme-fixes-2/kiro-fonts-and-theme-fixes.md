# Fonts offline + theme contrast + gradient guard + music cleanup

Paste this whole file into Kiro as one prompt, or save as `.kiro/specs/theme-fixes-2/tasks.md`. Base commit: `da66df9` on `develop` (confirmed current tip). Do the tasks IN ORDER, one commit each. Stop and report after each.

## Attached: `india-explorer-fonts.zip`

Contains REAL, verified `.woff2` font files (31 files, 504 KB total, every file's magic bytes checked as valid woff2) for all 11 font families the 5 themes reference (Baloo 2, Nunito, Orbitron, Inter, Bangers, Patrick Hand, Poppins, Roboto, Roboto Slab, Comic Neue, Exo 2), extracted from the official `@fontsource` npm packages at the exact weights the app currently requests from Google Fonts. Also contains the matching `fonts.css` with `@font-face` rules pointing at them. This was build-tested: `npm run build` succeeds, all 31 `@font-face` rules and all 31 font files appear correctly in the production output, zero requests to `fonts.googleapis.com`.

## Global rules (apply to every task)

- Run ONE task at a time, commit after each, report: files changed, anything unsure.
- Never use a raw hex/oklch/rgb color literal in a component. Use theme tokens only.
- No summary `.md`/`.txt` files in the repo root.

## Tasks

- [ ] 1. Make fonts fully offline (no more Google Fonts network request)
  - Unzip `india-explorer-fonts.zip`. Copy `src/assets/fonts/` into the repo's `src/assets/fonts/` (11 subfolders, 31 `.woff2` files — do not regenerate or re-download them, they are already verified).
  - Copy `fonts.css` into `src/styles/fonts.css` (replace if one already exists).
  - In `src/styles.css`, add `@import "./styles/fonts.css";` as the FIRST import, before `@import "./styles/tokens.css";`.
  - In `wrap-html.mjs`, find and DELETE these three lines (the `<link>` tags to `fonts.googleapis.com` and `fonts.gstatic.com` — there is a `preconnect` pair plus one `stylesheet` link with a long `family=...` query string). Replace with a one-line comment noting fonts are now bundled locally.
  - Run `npm install` (no new packages needed; this task adds no npm dependency — the fonts are committed files, not an `@fontsource` package).
  - VERIFY: `npm run build`; in the built output (`dist/client/assets/*.css`), confirm 31 occurrences of `@font-face` and 31 `.woff2` files exist, and `grep -r "fonts.googleapis" wrap-html.mjs src/styles.css` returns nothing. Load each theme on a real device and confirm text renders in its distinct font (Aero = Orbitron, Cartoon Comic = Bangers, etc.), including with the device in airplane mode (this is the actual proof it is offline).

- [ ] 2. Remove the hardcoded gradient the theme guard still flags
  - In `src/components/screens.tsx`, find: `bg-gradient-to-br from-accent-1 via-accent-2 to-accent-5` (one `<div>`, roughly a 48px icon tile). Replace with `bg-accent-1` (a solid theme-token fill — no gradient, no hardcoded stops).
  - VERIFY: `node scripts/check-theme-tokens.mjs` passes with zero violations.

- [ ] 3. Fix theme contrast (currently 34 failures across all 5 themes, including the default)
  - Problem: `--action-primary-fg`, `--text-on-primary`, `--action-success-fg`, and `--accent-1-ink` through `--accent-5-ink` are hardcoded to white (`oklch(1 0 0)`) in every theme file (`src/styles/themes/clay.css`, `aero.css`, `cartoon-comic.css`, `glassmorphism.css`, `skeumorphism.css`) regardless of whether the underlying color is light or dark enough for white text to be readable. Some are as low as 1.77:1 (needs 4.5:1).
  - Fix: for EACH of the 5 theme files, and EACH of these 9 tokens (`--text-on-header`, `--action-primary-fg`, `--text-on-primary`, `--action-success-fg`, `--accent-1-ink`, `--accent-2-ink`, `--accent-3-ink`, `--accent-4-ink`, `--accent-5-ink`), compute the real contrast ratio of the token's current value against the background color it's actually used on (`--bg-header`, `--action-primary-bg`, `--action-success-bg`, `--accent-1` through `--accent-5` respectively), using the theme's own resolved CSS custom property values (inherit from `tokens.css` defaults where a theme file does not override something). For each pair, set the token to whichever of `oklch(0.22 0.05 260)` (dark ink) or `oklch(1 0 0)` (white) gives the HIGHER contrast ratio. Do not change the background colors themselves — only the two candidate text colors are allowed.
  - Also: `--text-muted` in `clay.css` and `skeumorphism.css` is only 3.95:1 against `--surface-card` (needs 4.5:1). Change its value to `oklch(0.42 0.04 260)` in both files.
  - VERIFY: write a small script (or reuse one if the repo already has a theme-contrast checker from an earlier task) that resolves each theme's tokens and checks these 9 pairs plus `--text-primary`/`--text-secondary`/`--text-muted` against `--surface-card`/`--bg-page`, using real WCAG relative-luminance math (not an approximation) — must report ALL 5 THEMES PASS with zero pairs below 4.5:1. Also visually confirm on a device: switch through all 5 themes and check button text, badge text, and header text are readable in each.

- [ ] 4. Fix the non-functional background music feature
  - Problem: `src/lib/themes.ts` references 5 music files (`clay-folk-loop.mp3`, `aero-synthwave-loop.mp3`, `cartoon-comic-upbeat-loop.mp3`, `glass-lofi-loop.mp3`, `skeu-nostalgic-loop.mp3` under `public/music/`). All 5 files that exist in `public/music/` are 0 bytes (empty placeholders), and 2 of the 5 filenames referenced in code do not match the files that were actually created. The feature is completely non-functional: toggling music does nothing, silently.
  - We do not have real licensed audio to ship right now. Do NOT fabricate fake/silent audio files and do NOT leave a toggle that does nothing — that is worse than no feature, since parents and kids will think the toggle is broken.
  - Fix: in `src/components/ThemesScreen.tsx`, remove the music toggle UI entirely (the `musicEnabled` state, `handleMusicToggle`, and the toggle switch/row in the render). In `src/lib/themes.ts`, remove the `musicUrl` field from every theme entry and from the `Theme` type. Delete the 5 empty files in `public/music/` and the now-unused `src/lib/theme-music.ts` (confirm nothing else imports it first — `grep -rn "theme-music" src`).
  - Leave a short code comment in `themes.ts` noting that per-theme music was removed because no real audio assets exist yet, and how to re-add it (restore `musicUrl`, add real licensed loop files to `public/music/`, restore the toggle in `ThemesScreen.tsx`).
  - VERIFY: `grep -rn "musicUrl\|theme-music\|isMusicEnabled\|playThemeMusic" src` returns nothing; `npm run build` and `npm run test` pass; the Themes screen no longer shows a music toggle.

## Definition of done

- `npm run build`, `npm run test`, `node scripts/check-theme-tokens.mjs` all pass.
- Zero network requests to any font CDN at runtime (test in airplane mode).
- All 5 themes pass contrast on every token pair listed in task 3.
- No dead/non-functional UI (the music toggle is gone, not silently broken).
