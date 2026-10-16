# Implementation Plan

## Overview

This spec addresses critical production issues affecting the Journey screen and related components:
1. Journey tab crashes on load due to missing EMOJI import
2. "undefined" text appearing in UI from incorrect EMOJI namespace references
3. Garbled trophy emoji with mojibake bytes in screens.tsx
4. Missing tap sound feedback on Themes screen
5. CI gate enforcement to prevent similar issues

These 16 TypeScript errors currently block the typecheck gate in test.yml, indicating a gap in merge protection that needs investigation.

## Tasks

### Global Rules (apply to every task)
- Run ONE task at a time, commit after each, report: files changed, anything unsure
- Verify with `npx tsc --noEmit` after every task — zero errors before moving on, not just the errors that task targeted
- Scripts and codemods read/write UTF-8 explicitly (`fs.readFileSync(f, 'utf8')`); never PowerShell Get-Content/Set-Content without -Encoding utf8, never latin1
- Change only what the task lists — no refactors, restyling, or new features riding along
- No `any`, `as any`, `@ts-ignore`, or `eslint-disable` to make an error disappear
- No summary .md/.txt files in the repo root

### [ ] 1. Fix the Journey tab crash
**Priority: Critical - do this first, it's a total crash on the default path into Journey**

- [ ] 1.1 In `src/components/JourneyDestinationCard.tsx`, add `import { EMOJI } from "@/constants/emoji";` at the top of the file
- [ ] 1.2 Confirm `npx tsc --noEmit` no longer reports `Cannot find name 'EMOJI'` for this file

**VERIFY:** Open the Journey tab from a fresh app state (0 states completed) — it must render the region grid with no ErrorBoundary fallback, and every visible "Play"/"Replay"/"Locked" button must show its icon.

**Context:** JourneyDestinationCard.tsx calls `EMOJI.action.replay` / `EMOJI.action.play` but never imports EMOJI. tsc confirms: `Cannot find name 'EMOJI'`. This is a ReferenceError at runtime, and the component renders for every "available"/"current" state tile — the default view the instant Journey opens — so it crashes for everyone, caught by the root ErrorBoundary.

---

### [ ] 2. Fix every "undefined" caused by wrong EMOJI.utility.* references

- [ ] 2.1 `src/components/IndiaProgressMap.tsx` — `getMotivationalMessage()` (lines 38, 42, 44, 67): replace `EMOJI.utility.rocket` → `EMOJI.action.rocket`, `EMOJI.utility.trophy` → `EMOJI.milestone.hundred` (or `EMOJI.feedback.trophy`), `EMOJI.utility.tree` → `EMOJI.ageBand.mid`
- [ ] 2.2 `src/components/FirstSessionTutorial.tsx` (lines 82, 139) — same `EMOJI.utility.trophy` / `.rocket` mistake; apply the same mapping and check what the tutorial actually shows at each step (it likely currently renders "undefined" too)
- [ ] 2.3 `src/components/screens.tsx` — `EMOJI.utility.funFact` (×2, lines 2102, 2420), `.brain` (2481), `.game` (2496), `.state` (3010): find or add the correct icon in `src/constants/emoji.ts` under the right namespace (don't bolt more mismatched keys onto utility) and point each call site at it
- [ ] 2.4 Grep the whole repo for `EMOJI.utility.` and confirm every remaining usage is one of `worldMap`/`population`/`capital`/`food`/`warning`/`language` — the only keys that namespace actually has

**VERIFY:** `npx tsc --noEmit` reports zero `Property '...' does not exist on type` errors for EMOJI.utility; manually walk Home at 0%, 50%+, and 75%+ progress and confirm no "undefined" appears in any motivational message.

**Context:** Several files reach into `EMOJI.utility.rocket` / `.trophy` / `.tree` / `.funFact` / `.brain` / `.game` / `.state`, none of which exist on EMOJI.utility (it only has worldMap/population/capital/food/warning/language). tsc lists 9 such errors across IndiaProgressMap.tsx, FirstSessionTutorial.tsx, and screens.tsx. At 0% progress this renders literally as "undefined Start exploring."

**Dependencies:** None — can run in parallel with task 1

---

### [ ] 3. Repair the garbled trophy emoji in screens.tsx

- [ ] 3.1 Grep 🏆 in `src/components/screens.tsx` — 10 lines, each followed by stray bytes ("¥, ", '€, "Š, 'ª, "¸, and a run of three on one line). List every hit before editing any
- [ ] 3.2 Review each hit individually — don't blanket-strip to plain 🏆. At least one (the "Listen" audio button) clearly wants a different icon (speaker/play, not trophy) based on its sibling branch using ⏸. Pick the icon that fits that spot's purpose
- [ ] 3.3 Re-save the file as UTF-8 explicitly after editing; re-run the byte scan to confirm 0 corrupted sequences remain
- [ ] 3.4 Add a check-mojibake step: extend `scripts/check-encoding.mjs` (or add a sibling script) to flag a 4-byte emoji sequence immediately followed by E2 80 + a C2/C3/C5-prefixed byte — the pattern that caught this. Wire it into `npm run lint` and test.yml so this can't land silently again

**VERIFY:** The byte scan finds 0 hits; visually confirm the streak pill (Home + Journey), the Daily Goals card, the "Locked" label, and the "Listen" button all show clean text/icons.

**Context:** Every occurrence of 🏆 in src/components/screens.tsx — 10 distinct lines — is followed by stray mojibake bytes ("¥, ", '€, "Š, 'ª, "¸). Confirmed with a byte-level scan; isolated to this one file, nothing elsewhere in src is affected. check-encoding.mjs doesn't catch it because the bytes are valid UTF-8, just the wrong characters.

**Dependencies:** Can run in parallel with tasks 1–2; task 3.4 depends on 3.1–3.3 being done first so the new check starts green

---

### [ ] 4. Wire fxTap() into the Themes screen

- [ ] 4.1 In `src/components/ThemesScreen.tsx`, add `import { fxTap } from "@/lib/fx";`
- [ ] 4.2 Call `fxTap()` at the top of `handleThemeSelect` and `handleMusicToggle`, and on the back button's onClick — matching the pattern already used in JourneyMapScreen's region buttons

**VERIFY:** Open My Style, tap a theme tile, the music toggle, and the back chevron — each must produce the same tap tone/haptic buzz heard on every other screen (Journey, Explore, etc.), not just the theme's background music.

**Context:** fxTap() (synthesized tone + haptic buzz, in src/lib/fx.ts) is wired into 27 files across the app, but ThemesScreen.tsx never imports or calls it — not on the theme tiles, the music toggle, or the back button.

**Dependencies:** None — independent of tasks 1–3

---

### [ ] 5. Make the CI gate real

- [ ] 5.1 Confirm `npm run typecheck` is a required status check on the branch's protection rule (not just present in test.yml) — these 16 errors shipping means something let a red check through
- [ ] 5.2 Run the full test.yml sequence locally (typecheck, check-encoding.mjs, lint, unit tests) on the branch before merging tasks 1–4, to confirm it's clean end to end once this spec is done

**VERIFY:** A fresh PR with all four tasks applied shows every test.yml check green, including the new check-mojibake step from task 3.4.

**Context:** `npm run typecheck` is a hard gate in test.yml (not continue-on-error), so these 16 total tsc errors mean the branch currently fails that check — worth finding out why it didn't block merge.

**Dependencies:** Tasks 1, 2, 3, 4

---

## Task Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                    Tasks 1, 2, 4                        │
│           (Can run independently in parallel)            │
│                                                          │
│  1. Fix Journey crash (CRITICAL - Priority)             │
│  2. Fix EMOJI.utility.* undefined errors                │
│  4. Wire fxTap() into Themes screen                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      Task 3                              │
│         Repair garbled trophy emoji                      │
│                                                          │
│         3.1, 3.2, 3.3 → 3.4                             │
│      (subtasks 1-3 first, then add check)               │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      Task 5                              │
│              Make the CI gate real                       │
│                                                          │
│              Depends on: 1, 2, 3, 4                     │
└─────────────────────────────────────────────────────────┘
```

**Critical Path:** Task 1 (Journey crash) → Task 5 (CI verification)

**Parallel Execution:** Tasks 1, 2, and 4 are independent and can be executed simultaneously. Task 3 can start in parallel but subtask 3.4 must wait for 3.1-3.3 completion.

## Notes

### Error Impact Summary
- **16 total TypeScript errors** currently failing CI typecheck
- **Journey tab**: Complete crash on default entry (task 1)
- **UI text corruption**: "undefined" appearing at 0% progress and in tutorial (task 2)
- **Visual corruption**: Mojibake bytes in 10 locations in screens.tsx (task 3)
- **UX inconsistency**: Missing haptic/audio feedback on Themes screen (task 4)

### Files Modified
- `src/components/JourneyDestinationCard.tsx` (task 1)
- `src/components/IndiaProgressMap.tsx` (task 2)
- `src/components/FirstSessionTutorial.tsx` (task 2)
- `src/components/screens.tsx` (tasks 2, 3)
- `src/components/ThemesScreen.tsx` (task 4)
- `src/constants/emoji.ts` (task 2 - may need additions)
- `scripts/check-encoding.mjs` or new script (task 3.4)
- `.github/workflows/test.yml` (task 3.4)

### Verification Commands
```bash
# After each task
npx tsc --noEmit

# Before task 5
npm run typecheck
npm run lint
npm test
node scripts/check-encoding.mjs

# Full CI simulation
npm run typecheck && node scripts/check-encoding.mjs && npm run lint && npm test
```

### Open Questions for Task 5
- Why did 16 TypeScript errors merge despite typecheck being a required CI step?
- Is the branch protection rule configured correctly?
- Was the check accidentally bypassed or overridden?
