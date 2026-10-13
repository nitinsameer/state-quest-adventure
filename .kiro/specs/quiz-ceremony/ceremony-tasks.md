# Quiz Completion Ceremony: implementation plan

Save as `.kiro/specs/quiz-ceremony/tasks.md`. Branch: `develop`. Stack: Tailwind v4, React 19, TanStack Start, Capacitor 6. Tasks 1 to 11 are done.

## Overview

This spec defines the implementation of a four-step reward ceremony that replaces the existing long-scrolling "State Complete" screen. The ceremony displays quiz results, a stamp collection interface, postcard customization, and progression guidance in a child-safe, scrollless design that matches the existing app's visual system and maintains all saved data across app closures.

## Goal

Replace the long, scrolling "State Complete" page with a short, four-step reward ceremony (about 15 seconds, no scrolling): **1 Result (stars and XP), 2 Stamp, 3 Postcard, 4 What's next.** It must look like a normal part of the app, not a separate design. It shows only values the app really saved. It stays safe for children aged 3 to 10.

## What is wrong today (verified in code)

- The bottom nav shows on quiz, card and completion screens. `src/routes/__root.tsx` (~line 259) lists `immersiveRoutes` as `/state/quiz`, `/state/learn`, `/state/card`, `/state/complete`, matched with `pathname.includes(...)`. The real paths are `/state/<slug>/quiz` and so on, so the match never succeeds.
- `StateCompletedScreen` (`src/components/screens.tsx` ~3362) uses `clay-blue` and `clay-green`, which do not exist in `src/styles/clay.css`, so both buttons fall back to the same orange. It also hardcodes `from-yellow-300 via-yellow-200 to-orange-200`, a hex confetti array, and 12 confetti divs positioned with `Math.random()` inside render (they jump on every re-render and sit on top of text).
- The page is one long scroll with a sticky header that cuts off the badge circle. The XP, stamp and score the child earned are not shown.
- Equal-weight "Replay Quiz" and "Next State" buttons; white text on orange.

## Look and feel rules (must match the existing app)

- Page background: the normal app page background (the cream gradient used on Home and Journey). NOT a flat yellow screen.
- Header band: the same rounded-bottom gradient header used on the Journey and Learning Hub screens (copy those classes; use the state's tone gradient `TONE_GRADIENT[state.tone]`). No new colours.
- Content in `clay-card clay-white` cards (rounded, same padding as Home cards). Chips: `clay-chip`. Progress tracks: `clay-progress-track`.
- Buttons: ONE primary per step, `clay-button clay-saffron` with ink text (`text-ink`), height at least 56px, same as the "Play" buttons. Secondary: `clay-button-soft`. Success states: `clay-success`. Never `text-white` on a saffron or pastel fill.
- Fonts and sizes: titles with `font-display` (Baloo 2) at 24px or more; body 16 to 18px (use the existing `text-body` and `text-h2` utilities); nothing below 14px.
- Illustrations: `STATE_ART[state.name]` for the state, the existing `mascot` image with its `mascot-cheer` class, emoji for stars and stickers (as the rest of the app does).
- Confetti: use the existing `ConfettiBurst` component only, behind content, `pointer-events-none`, at most 24 pieces for 1.5 seconds. Colours come from CSS tokens (`--color-saffron`, `--color-explorer`, `--color-success`, `--color-gold`), not hex.
- Theme-ready: use only semantic classes and tokens. No raw hex, no `bg-gradient-to-*` with Tailwind palette colours, no `bg-white` or `text-white` outside the shared header classes. This lets the planned theme system restyle the ceremony without edits.
- Screen frame for every step: full-height, no scroll at 360x640, safe-area padding at the bottom, bottom nav hidden.

## Global rules (apply to every task)

- Run ONE task at a time; stop when done; commit after each sub-task.
- Never send ceremony choices (stickers, steps) to analytics. Nothing new leaves the device.
- Any new field saved in progress needs a Zod schema update AND a round-trip test (real save calls, then `validateProgress` on the stored JSON). This is how the avatar bug wiped data before. A save that fails validation must never delete data.
- Respect `prefers-reduced-motion`: no animation, values shown immediately.
- No timers, countdowns, loss warnings, ads or purchase prompts anywhere in the ceremony.
- Do not change quiz scoring rules: 6 or more right = 3 stars, 4 or more = 2, otherwise 1; XP = +20 per first-time correct answer plus the +100 state bonus.
- Report after each task: files changed, files deleted, anything unsure. No summary files in the repo root.

## Task Dependency Graph

```
12.1 (Bottom Nav Fix)
     └─ 12.2 (Save Ceremony Data)
        ├─ 12.3 (Ceremony Shell & Routing)
        │  ├─ 12.4 (Step 1: Result)
        │  ├─ 12.5 (Step 2: Stamp)
        │  ├─ 12.6 (Step 3: Postcard)
        │  └─ 12.7 (Step 4: What's Next)
        │     └─ 12.8 (Region Master Badge)
        │
        └─ 12.8 (Region Master Badge - also depends on 12.2)

12.9 (Remove Old Screen) - depends on 12.3 through 12.7
12.10 (Quality Gates) - final verification
```

## Tasks

- [ ] 12.1 Fix the bottom nav on immersive screens (ship this alone, it also fixes quiz and learning cards)
  - In `src/routes/__root.tsx`, replace the `includes` check with a pattern: `/^\/state\/[^/]+\/(quiz|learn|card|cards|complete|postcard|unlock)(\/|$)/`. Also treat `/onboarding`-style pre-auth routes as before.
  - VERIFY: Playwright test that the nav is absent on those routes and present on Home, Journey, Explore, Badges, Me, and the state welcome screen.

- [ ] 12.2 Save everything the ceremony needs (data first, UI later)
  - Extend the pending-celebration entry created by `finishQuiz` in `src/lib/progress.ts` to include: `stateName`, `stars`, `correctCount`, `totalQuestions`, `quizXp` (sum of newly awarded +20), `bonusXp` (100), `stampDate`, `earnedBadgeIds`, `regionKey`, `regionDone`, `regionTotal` (from `REGIONS` in `src/lib/passport-helpers.ts`), `streak`, `leveledUp` (and the new level name, reusing the existing level logic behind "Level 1 · Explorer", do not create a second one), `step` (0 to 3, the current ceremony step), `sticker` (optional).
  - On a replay (state already completed): no XP is repeated; only improved stars are saved; do not queue a new full ceremony, queue a short "stars improved" result.
  - Update the Zod schema for the pending celebration and add the round-trip test described in the global rules.
  - VERIFY: unit tests for first completion, replay with better stars, replay with equal stars; round-trip validation passes.

- [ ] 12.3 Ceremony shell and routing
  - Create `src/components/ceremony/QuizCeremony.tsx` with a step index stored in the pending celebration (`step`), so closing the app mid-ceremony resumes at the same step on the next launch. Render it from `src/routes/state.$slug.complete.tsx` instead of `StateCompletedScreen` (keep the existing guard that redirects when the state is not completed).
  - Shared frame: the header band (see look-and-feel rules), a title for the step, a row of 4 step dots (`clay-chip` style), the step content in clay cards, one primary button at the bottom. A small "Skip" in the top corner jumps to step 4 and shows the saved results at once; it never discards rewards.
  - Dismiss the pending celebration (`dismissPendingCelebration`) only when step 4's primary button is pressed. The Home popup then never repeats a ceremony the child already saw. If the child leaves early, Home shows the existing pending card that reopens the ceremony at the saved step.
  - VERIFY: reload on each step resumes on that step; reaching Home after step 4 shows no popup.
  - _Depends on: 12.2_

- [ ] 12.4 Step 1: Result
  - Big headline from saved data ("6 of 7 right!"). Three star slots that fill one at a time (400 ms apart, `fxCorrect` per star, haptic). A hint under the stars ("6 right = 3 stars").
  - Two `clay-chip`s that count up: "+{quizXp} XP quiz" then "+{bonusXp} XP state bonus", then the XP bar with the level (reuse the Home XP/level component if one exists). If `leveledUp`, show a banner "New level: {name}".
  - The mascot with a speech bubble by stars: 3 = "Three stars! Amazing!", 2 = "Great job!", 1 = "Good try! Play again for more stars." Read it aloud with the existing narration (TTS) only when narration is on.
  - Primary button: "Next".
  - VERIFY: shows exactly the saved numbers for 1, 2 and 3 stars; reduced motion shows everything at once.
  - _Depends on: 12.3_

- [ ] 12.5 Step 2: Stamp
  - A Passport page card with a large round "Stamp it!" target (at least 120px). One tap plays the stamp animation (transform only), `fxStamp`, a haptic, and shows "Stamp {n} of 36". If the child does not tap within 4 seconds, stamp automatically (for the youngest children).
  - The stamp artwork: state art and name inside a ring using token colours; the date from `stampDate`.
  - Primary button "Next" appears after stamping.
  - VERIFY: tap and auto-stamp both work; the count equals `completed.length`.
  - _Depends on: 12.3_

- [ ] 12.6 Step 3: Postcard
  - Reuse `PostcardFrame` as it is. Slide it in. Under it: "Pick a sticker" with three big emoji buttons from a fixed list (for example 😋 🏞️ 🎉); the choice is saved in the postcard data (schema and test). Show "Saved in your Passport ✓".
  - A small secondary "Share" button opens the existing parent gate and then the share sheet (from task 4). Child-facing text never mentions sharing.
  - Parent Zone setting "Include my child's name on shared postcards", default OFF. The ceremony postcard on the device may show the name; the shared image only if the setting is on.
  - VERIFY: sticker persists across reload; share needs the PIN; no storage permission is requested.
  - _Depends on: 12.3_

- [ ] 12.7 Step 4: What's next
  - A region card: one dot per state in the region ("Northern Region 1 of 6") and the streak flame ("2-day streak", no loss wording). A tile for the next state from `nextStateAfter` with its art.
  - Buttons: primary "Next State"; secondary `clay-button-soft` "Play again for ⭐⭐⭐" ONLY when stars is below 3; a plain text-style "Home" button.
  - If this state completed its whole region, show a "Region Master" banner above the buttons (see 12.8).
  - VERIFY: the replay button appears for 1 and 2 stars and is hidden for 3 stars; Next State opens the next state.
  - _Depends on: 12.3_

- [ ] 12.8 Region Master badge
  - When the last state of a region is completed (use `REGIONS`), award one "Region Master" achievement once (idempotent, saved in the same atomic save as the state completion in `finishQuiz`), and add it to the Achievements screen. Schema and round-trip test required.
  - VERIFY: completing all 6 northern states awards it exactly once; replays do not repeat it.
  - _Depends on: 12.2_

- [ ] 12.9 Remove the old screen and clean up
  - Delete `StateCompletedScreen` and its hardcoded confetti divs; remove the now-unused `clay-blue`/`clay-green` references; make sure nothing else imports the old component.
  - Hardcoded numbers or labels such as "+250 XP", "State Complete Badge" and the trophy placeholder must not exist anywhere.
  - VERIFY: `grep -rn "clay-blue\|clay-green\|StateCompletedScreen" src` returns nothing; tsc, lint, tests, build pass.
  - _Depends on: 12.3 to 12.7_

- [ ] 12.10 Quality gates
  - Playwright: finish a quiz with 7, 5 and 2 correct answers; check stars, XP, step order, reload mid-ceremony resumes, nav hidden, no vertical scroll at 360x640 and 411x891, axe contrast passes on all four steps, tap targets at least 48px.
  - Screenshots of each step saved to the PR. Compare the header band, cards and buttons with Home and Journey: same radius, shadow, font and colours.
  - VERIFY: `npm run build` and `npm run test` pass; the screenshot spec passes.

## Implementation Plan

Execute tasks in dependency order: 12.1 first (ships alone), then 12.2 (provides data layer), then 12.3 through 12.7 in parallel where dependencies allow, 12.8 after 12.2, 12.9 after 12.3–12.7, and 12.10 as the final verification gate. Each sub-task must commit independently to preserve history and enable rollback. Prioritize data validation (schema, round-trip tests) before UI rendering to prevent silent data loss.

## Notes

- The `step` field in `pending-celebration` persists the current ceremony step so the ceremony resumes at the exact position if the app is closed and reopened.
- All saved values (stars, XP, badge IDs, region progress) are displayed exactly as persisted in the progress context; no recalculation occurs during rendering.
- The ceremony is hidden from analytics per global rules; sticker choices and step transitions do not generate events.
- Haptic and sound feedback use existing helpers (`fxCorrect`, `fxStamp`) to maintain consistent sensory design.
- The "Skip" button fast-tracks to step 4 without discarding rewards; it is a UX comfort feature for older children or repeated playthroughs.
- The auto-stamp on 4-second timeout is a child-safety feature for toddlers; no explicit timeout UI is shown.
- Parent Zone setting for postcard name inclusion must default OFF and persist in the existing settings schema.
- The Region Master badge is awarded atomically during `finishQuiz` to ensure it never duplicates on replays.

## Definition of done

- After a quiz, the child sees four short steps and every number shown was really awarded and saved.
- Closing the app at any point loses nothing and resumes the ceremony.
- Visually the ceremony is indistinguishable in style from Home, Journey and the Learning Hub (same header band, clay cards, buttons, fonts).
- No raw hex, palette classes or `text-white` on fills in the new code; the bottom nav is hidden; no scrolling needed.

## Out of scope

- Changing quiz questions, scoring, or the learning cards flow.
- New app styles or themes (see the theme-system plan).
- Sound design beyond the existing `fx` helpers.
