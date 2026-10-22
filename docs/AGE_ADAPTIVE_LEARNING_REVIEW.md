# Age-adaptive learning implementation review

## Scope

Reviewed age selection, age-tagged state-card content, and quiz generation on `feature/age-adaptive-learning`.

## Changes in this branch

- Quiz selection now uses age band and a question difficulty tier instead of changing only quiz length.
- Difficulty tiers are `foundation`, `recall`, and `challenge`, mapped explicitly by existing question type.
- Ages 3–5 receive foundation questions; ages 6–7 receive foundation and recall; ages 8–9 receive a broader mix; ages 10–12 can receive all tiers.
- Existing quiz lengths (3, 5, 7, 10) are preserved.
- Added tests that check every state has the expected number of unique, eligible questions for every age band.

## Important limitation

This is a first-pass selection layer, not a complete developmental or scientific content audit. Existing prompts are largely factual recall. The 3–5 experience still uses text-based questions and is not yet a fully picture-led, pre-reader experience. Do not claim every prompt is developmentally validated solely because it has a difficulty label.

## Recommended next phase

1. Audit each state/UT card and question for factual accuracy, reading level, ambiguous distractors, and age fit.
2. Expand the content schema to support authored age-specific question variants and hints rather than relying only on question-type tiers.
3. Use quiz outcomes to adjust difficulty gently; avoid treating age as a proxy for ability.
4. Review the age screen's parent/guardian agreement and consent flow separately. Explicit agreements must not be preselected or silently granted.
5. Run `npm test -- --run src/lib/__tests__/quiz.test.ts`, `npm run typecheck`, and `npm run lint` before merging.

## Validation status

Source and tests have been updated, but automated CI has not yet been run for this branch. The branch is not merged into `develop`.
