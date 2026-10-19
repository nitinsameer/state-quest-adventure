# Theme picker redesign: category chips + progress-based unlocks

Paste this whole file into Kiro as one prompt, or save as `.kiro/specs/theme-unlocks/tasks.md`. Do the tasks IN ORDER, one commit each, stop and report after each.

## Goal

Replace the flat 19-theme 2-column scroll with: (1) 5 starter themes unlocked immediately, (2) the other 14 unlocked progressively by real progress milestones (states completed, streak, badges — all already tracked in `src/lib/progress.ts`), (3) a category-chip filter so a child only ever sees a handful of tiles at once, grouped by feel, never a 19-item wall.

## Global rules (apply to every task)

- Run ONE task at a time, commit after each, report: files changed, anything unsure.
- Reuse existing infrastructure — do not invent a second notification/celebration system, a second theme-ID list, or a second progress-tracking mechanism. This project has already had real bugs from duplicated/stale copies of data that should have one source of truth (a hand-typed theme-ID list going stale, a duplicate CSS token being edited in the wrong place). Grep for an existing pattern before adding a new file.
- Every new piece of UI must pass the project's existing axe contrast checks and work with `prefers-reduced-motion`.
- No summary `.md` files in the repo root.

## Tasks

- [ ] 1. Define the starter set and the unlock rules in the registry (data only, no UI yet)
  - In `src/lib/themes.ts`, set these 5 themes to unlocked-by-default (no change needed if already unlocked; just confirm and document): `clay`, `claydark`, `cartoon`, `minimal`, `pop`.
  - Add an `unlockRule` field to the `Theme` interface: `unlockRule?: { type: "states" | "streak" | "badges" | "firstBadge"; value: number }` (optional; absent = unlocked by default). Assign these to the other 14 themes:
    - `aero`: `{ type: "states", value: 3 }`
    - `brutal`: `{ type: "states", value: 6 }`
    - `bento`: `{ type: "states", value: 10 }`
    - `paper`: `{ type: "states", value: 15 }`
    - `material`: `{ type: "states", value: 20 }`
    - `neu`: `{ type: "states", value: 25 }`
    - `skeuo`: `{ type: "states", value: 30 }`
    - `glass`: `{ type: "states", value: 36 }`
    - `oled`: `{ type: "streak", value: 3 }`
    - `aurora`: `{ type: "streak", value: 7 }`
    - `cyber`: `{ type: "streak", value: 14 }`
    - `term`: `{ type: "firstBadge", value: 1 }`
    - `synth`: `{ type: "badges", value: 10 }`
    - `pixel`: `{ type: "badges", value: 25 }`
  - Add a `category` field to the `Theme` interface: `category: "bright" | "night" | "fancy" | "clean" | "classic"`. Assign: bright = pop, cartoon, brutal, bento; night = claydark, oled, term, cyber, synth; fancy = glass, aurora, skeuo; clean = minimal, material, paper, neu; classic = clay, aero.
  - VERIFY: `npx tsc --noEmit` passes; every one of the 19 themes has exactly one category and the 5 starters have no `unlockRule`.

- [ ] 2. Unlock-check function and real-progress wiring (logic only, no UI)
  - In `src/lib/themes.ts`, add `isThemeUnlocked(theme: Theme, progress: { completed: string[]; streak: number; badges: Record<string, string[]> }): boolean` that evaluates a theme's `unlockRule` against real progress: `states` → `progress.completed.length >= value`; `streak` → `progress.streak >= value`; `badges` → total badge count across all states (`Object.values(progress.badges).flat().length`) `>= value`; `firstBadge` → total badge count `>= 1`. No `unlockRule` → always unlocked.
  - Add `getUnlockedThemes(progress): Theme[]` and keep `getVisibleThemes()` as-is for anything that still needs "all non-hidden, non-heavy" themes (e.g. an admin/debug view) — do not remove it, just don't use it for the picker going forward.
  - Unit tests: for each of the 14 unlock rules, confirm the theme is locked just below the threshold and unlocked exactly at it. Use real progress objects shaped like what `src/lib/progress.ts` actually produces (check `src/lib/localStorage-schema.ts` for the real field names/types — `completed`, `streak`, `badges`), not invented shapes.
  - VERIFY: all new unit tests pass; `npx vitest --run` overall still 100% pass.
  - _Depends on: 1_

- [ ] 3. Theme-unlock celebration (reuse the existing pending-celebration queue, do not build a new one)
  - `src/lib/progress.ts` already has a `PendingCelebration` type and a `pendingCelebrations` queue (used for the post-quiz ceremony). Add a new celebration kind to that same type/queue — e.g. `{ kind: "theme-unlock"; themeId: string; themeName: string }` — rather than creating a second queue or a new localStorage key.
  - After any progress-changing action (`completeState`/`finishQuiz`, a streak update, a badge award — find the actual call sites in `src/lib/progress.ts`), check `isThemeUnlocked` for every currently-locked theme the player now qualifies for and push one `theme-unlock` pending celebration per newly-unlocked theme, in the same atomic `set()` call as the progress update (this project has had real bugs from updates that aren't atomic with the state they depend on — keep it in the same write).
  - Build a small celebration screen/modal for this kind (can reuse the existing celebration component's shell/animation if one exists for badges — check `src/components/` for an existing achievement/badge-unlock modal before building a new one). Content: theme name, a live mini-preview using that theme's own tokens (not hardcoded colors — same approach as the picker tiles), a "Try it now" button that calls `setTheme(themeId)` directly, and a "Maybe later" button that just dismisses.
  - VERIFY: complete enough states/streak/badges in a test to trigger at least 2 different unlock kinds; confirm the celebration appears once, survives an app close/reopen if not yet dismissed (same pattern as the existing pending-celebration queue), and never duplicates.
  - _Depends on: 2_

- [ ] 4. Category-chip picker UI
  - Rebuild `src/components/ThemesScreen.tsx`'s layout: a horizontal row of 5 category chips at the top (🌞 Bright & Fun, 🌙 Night Mode, ✨ Fancy, 🧊 Simple & Clean, 🧡 Classic — using `EMOJI` constants, not hardcoded emoji literals, per this project's existing convention), each chip showing an unlocked-count badge like "2 of 5". Tapping a chip filters the grid below to that category only (default: the category containing the currently-active theme, or "Classic" if none).
  - Grid below: only themes in the selected category, in the picker's existing tile style. For a LOCKED theme in the selected category: show the tile dimmed/grayscale with a lock icon overlay and one short line stating the unlock condition in plain, child-friendly language (e.g. "Explore 10 states to unlock!", "3-day streak to unlock!" — derive this text from the theme's `unlockRule`, don't hand-write 14 separate strings that can go stale). Locked tiles are not tappable to apply (tapping shows the same unlock-condition text, does not call `setTheme`).
  - An unlocked theme in the selected category behaves exactly as today (live preview, tap to apply instantly).
  - Use `getUnlockedThemes()`/`isThemeUnlocked()` from task 2 to compute lock state from the real current progress (read it the same way the rest of the app reads progress — check `useProgress()` or equivalent hook already used elsewhere, don't re-read `localStorage` directly if a hook already exists).
  - VERIFY: with a fresh/zero-progress profile, only the 5 starter themes are tappable across all categories combined, and every locked tile shows a correct, non-stale unlock condition; manually advance progress and confirm tiles unlock live without needing an app restart.
  - _Depends on: 2, 3_

- [ ] 5. Quality gates
  - Axe contrast check on the new chip row and locked-tile overlay (dimmed/grayscale state still needs readable text per this project's existing contrast standard, 4.5:1 minimum).
  - Screenshot test: Themes screen in each of the 5 categories, both an all-locked-except-starters state and a mostly-unlocked state.
  - Confirm `prefers-reduced-motion` disables the unlock-celebration's animation (values still shown immediately, just no motion).
  - VERIFY: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all pass. Report the full output, not a summary.

## Definition of done

- A brand-new profile sees exactly 5 tappable themes, grouped under 5 category chips, no scroll wall.
- Completing states, building a streak, or earning badges unlocks the other 14 live, with a celebration moment reusing the existing pending-celebration system.
- No duplicated theme-ID lists, no second notification queue, no hand-written unlock-condition strings that can drift from the real `unlockRule` data.
