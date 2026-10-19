# Full hardcoding audit: find everything breaking theme-awareness

Paste this whole file into Kiro as one prompt, or save as `.kiro/specs/hardcoding-audit/tasks.md`. This project has 19 themes (`src/styles/themes/*.css`, registered in `src/lib/themes.ts`). ANY hardcoded color, shadow, border, or style in a component bypasses all 19 themes and causes exactly the bugs we keep finding: white screens, dark-on-dark text, light-on-light text, invisible borders, buttons that don't match the selected theme.

## CRITICAL RULE FOR THIS TASK

**Do not write a markdown file claiming things are "verified" or "fixed" without evidence.** Every fix must be provable by: (a) a script that actually scans the code and reports a before/after count, or (b) a real screenshot. A past attempt at this exact kind of task produced a document with checkmarks claiming colors were verified in the running app that were provably wrong (it described the reference design's colors, not the app's actual colors) — don't repeat that. If you did not run something and see its real output, do not claim it passed.

## Phase 1: Build the detector (do this first, as its own commit)

Create `scripts/audit-hardcoding.mjs`. It must scan all of `src/**/*.tsx` and `src/**/*.ts` (excluding `__tests__`, `.test.`, and `src/styles/themes/*.css` which are allowed to contain real colors) and detect EVERY one of these categories, printing file:line and the matched text for each:

1. **Raw Tailwind palette classes** — any class matching `(bg|text|border|from|to|via|ring|fill|stroke|shadow|divide|outline|caret|accent|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}` in a `className`.
2. **`bg-white` / `text-white` / `bg-black` / `text-black`** and their opacity variants (`/NN`) in a `className`.
3. **Tailwind gradient classes with literal color stops** — `bg-gradient-to-*` combined with any `from-`, `via-`, `to-` that is NOT `from-accent-N` / `to-accent-N` / a CSS-variable-backed utility (i.e. gradients using raw palette or hex stops).
4. **Hex color literals** (`#[0-9a-fA-F]{3,8}`) anywhere inside a `.tsx`/`.ts` file outside of `src/styles/themes/*.css`, `src/lib/themes.ts`'s `previewTokens` (those are legitimate — they describe each theme's swatch for the picker, not live styling) and `src/constants/emoji.ts`.
5. **`rgb()`/`rgba()`/`hsl()`/`hsla()` literals** in component code (not inside a `var(--x, rgba(...))` CSS fallback, which is acceptable).
6. **Inline `style={{...}}` with a literal color/background/border/shadow value** — i.e. `style={{ color: '#fff' }}` or `style={{ backgroundColor: 'red' }}`, as opposed to `style={{ color: 'var(--text-primary)' }}` which is fine. Flag any inline style color/background/border/boxShadow property whose value does NOT contain `var(--`.
7. **Invented/non-existent CSS properties in inline styles** — React will silently accept any key you put in a `style={{}}` object without any build-time or type error if it's a valid CSSProperties shape, but values like `borderOpacity` are not real CSS and do nothing. Flag any `style={{...}}` key that is not a standard CSS property (cross-check against a list of valid React `CSSProperties` keys, or just flag unusual camelCase keys that don't correspond to anything in `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference` — at minimum flag: `borderOpacity`, `backgroundOpacity`, `colorOpacity`, and any other `*Opacity` suffix that isn't plain `opacity`).
8. **`text-ink` (or any hardcoded-ink utility) used directly on a themed/colored fill** — specifically flag `text-ink` or `text-white` appearing in the same `className` string as `ui-button`, `ui-chip`, `ui-badge`, `ui-tab`, `clay-button`, `bg-accent-`, `bg-action-`, since the correct text color for a themed fill must come from that fill's own `-fg`/`-ink` token, not a hardcoded value.
9. **Old Tailwind v3 arbitrary-variable syntax** — `[a-z-]+-\[--[a-z0-9-]+\]` (e.g. `p-[--padding-md]`). In this project's Tailwind v4 setup this produces NO CSS at all (silently breaks spacing/sizing). The correct v4 form is `p-(--padding-md)`.
10. **`var(--x)` references where `--x` is never defined** anywhere in `src/styles/tokens.css` or any `src/styles/themes/*.css` file. Build a set of every `--token` defined across all CSS files, and a set of every `var(--token` referenced in CSS or component code; report any referenced token with zero definitions (exclude framework-internal prefixes: `--tw-`, `--radix-`, `--sidebar`, `--vaul`, `--chart-`, `--confetti-`, `--cell-size`).
11. **CSS custom property declared under `:root` or a bare (non-`[data-theme="x"]`) selector with a literal color value**, when a same-named token also exists inside `[data-theme="..."]` blocks — this means a component reading that unscoped version never changes with the theme. Report the property name and which file/line has the unscoped version.
12. **Duplicate declarations of the same `--token` within the same `[data-theme="x"]` selector block in one file** (dead/overridden declarations — the kind of leftover that silently reverts a fix if someone edits the wrong copy later).
13. **Hardcoded theme-ID lists or unions that don't match the live registry** — search for any place a theme id string (`"clay"`, `"aero"`, etc.) is hand-typed in an array, union type, or switch/case OUTSIDE of `src/lib/themes.ts` itself. Cross-check each hand-typed list against `THEMES.map(t => t.id)` from `src/lib/themes.ts` and flag any mismatch or staleness (this exact pattern caused 14 of 19 themes to silently fail to survive an app reload — don't let it recur in a different file).
14. **Type casts that force an unrelated type over a theme/style value** — e.g. `as "clay" | "aero" | ...` or any `as` cast whose target type is a hand-typed union of what looks like theme/color names. These hide the exact kind of staleness in category 13 from the TypeScript compiler. Flag every one found.
15. **Components that hardcode which theme/style looks a certain way** — e.g. `if (theme === 'cyber') return <div style={{color:'cyan'}}>` — any conditional branching on a specific theme ID inside a component (as opposed to using CSS tokens that automatically adapt). List these separately; they may be legitimate for truly theme-specific behavior (e.g. disabling blur on low-end devices) but each one is a place where adding theme #20 requires a code change, which is a smell worth knowing about even if not auto-fixed.

The script must print a clean summary table: category name, count, and the list of `file:line`. Exit code 1 if total count > 0 (minus the `src/styles/themes/*.css` and `src/lib/themes.ts` previewTokens exemptions noted above).

VERIFY: run it, paste the FULL raw output (not a summary, the actual tool output) into your reply before doing anything else.

## Phase 2: Fix by category, one category at a time, one commit per category

For each category with violations found in Phase 1, fix ALL instances in that category before moving to the next category. Use this mapping (same conventions already used elsewhere in this codebase):

- Raw palette color on a surface → nearest semantic token: backgrounds → `bg-surface-card` / `bg-surface-raised` / `bg-surface-sunken` / `bg-page` / `bg-header` (by role, not by looking similar); text → `text-primary` / `text-secondary` / `text-muted` / `text-on-header` / `text-on-primary`; feedback colors (success/warning/error/info) → `fb-success-*` / `fb-warning-*` / `fb-error-*` / `fb-info-*` tokens; everything else → the nearest `accent-1` through `accent-5` (and its `-soft`/`-ink` pair).
- `bg-white`/`text-white` on a themed surface → the matching semantic token above. On a solid header/button fill specifically, use that fill's own `-fg` token, never a hardcoded white or ink.
- Gradient with literal stops → `bg-header` / `bg-hero` / `bg-cta` (gradient-capable utilities already defined in `src/styles/ui.css`) which resolve through the active theme's own gradient token — never hand-write gradient stops in a component.
- Hex/rgb/hsl literal anywhere in `.tsx`/`.ts` → the semantic token for that role. For canvas/postcard drawing code (`fillStyle`, `strokeStyle`), read the color via `getComputedStyle(document.documentElement).getPropertyValue('--token-name')` at draw time instead of a literal, so postcards redraw correctly per theme.
- Inline `style={{ color: '#fff' }}` → either move to a className using a semantic utility, or if inline is required (e.g. computed per-item), use `style={{ color: 'var(--text-primary)' }}`.
- Invented CSS properties (`borderOpacity` etc.) → either delete if the surrounding `opacity` already achieves the visual intent, or implement properly with a `color-mix()`/rgba on the actual `border-color`/`background-color`.
- `text-ink`/`text-white` hardcoded on a themed fill → remove it; let the fill's own component class supply its foreground color via its `-fg` token.
- Old `[--var]` arbitrary syntax → rewrite to `(--var)`.
- Undefined `var(--x)` → either define `--x` in `tokens.css` (default) AND in every `src/styles/themes/*.css` file that should override it, or fix the typo if it was meant to reference an existing token.
- Unscoped `:root` color when a themed version also exists → remove the unscoped/duplicate declaration; the value must live ONLY inside the appropriate `[data-theme="x"]` block(s), with `tokens.css`'s `:root, [data-theme="clay"]` block serving as the actual default.
- Duplicate same-token declarations inside one `[data-theme="x"]` block → delete the dead one, keep the real one, and leave a one-line comment if the surviving value is non-obvious (e.g. a gradient instead of what looks like the "main" value).
- Stale hand-typed theme-ID list → replace with `THEMES.map(t => t.id)` imported from `src/lib/themes.ts` (the single source of truth), the same fix already applied in `src/store/themeStore.ts` — do not reintroduce a second hardcoded copy anywhere else.
- Forced type casts hiding a stale union → remove the cast; widen the underlying type to `string` or derive it from `THEMES`, matching the `themeStore.ts` pattern.

After each category, re-run `scripts/audit-hardcoding.mjs` and confirm that category's count is 0 before moving to the next, and that no other category's count went UP (a fix must not introduce a new violation elsewhere).

## Phase 3: Lock it down permanently

- Add `node scripts/audit-hardcoding.mjs` to the `lint` script in `package.json` and to CI, so it runs on every commit from now on and fails the build on any violation.
- Add a short `docs/theming.md` explaining the token contract (link to `src/styles/tokens.css` as the canonical list) and the one rule: components use semantic classes/tokens only, never raw colors, never hand-typed theme-ID lists.

## Phase 4: Real visual proof, not a claims document

For a representative sample of at least 6 of the 19 themes (pick a spread: 2 light, 2 dark, 2 "heavy"/textured like glass or cyber), take an actual screenshot of: Home, a quiz question, the Learning Hub, and the Themes picker itself. Attach the real screenshot files (or paste the actual rendered output) to your final report — not a description of what they should look like. If you cannot produce real screenshots in this environment, say so explicitly instead of writing prose that implies you saw them.

## Final report format

1. Phase 1's full raw tool output (before any fixes).
2. For each category: count before → count after, and the exact list of files touched.
3. Phase 1's tool output again, run fresh, after all fixes (should be all zeros).
4. `npm run typecheck`, `npm run test`, `npm run build` output (full, not summarized) — all must pass.
5. The screenshots or an explicit statement that none could be produced.
6. A short list of anything from category 15 (theme-specific conditional code) left in place, with file:line, so a human can review whether each one is intentional.
