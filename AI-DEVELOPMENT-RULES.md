# AI Development Rules - Explore India

This document establishes explicit rules for AI-assisted development (Kiro, Lovable, Claude, etc.) to prevent regression to the white-screen issue and maintain a stable, reproducible build.

## Core Principle

**Maximize content/UI/feature work while minimizing infrastructure changes.**

The build configuration is STABLE. Treat it as LOCKED unless explicitly instructed otherwise.

---

## RULE 1: UI/Content Changes Are Allowed ✅

You MAY modify:

- React component UI (JSX, HTML structure)
- Styling (Tailwind classes, CSS utilities)
- Colors, typography, spacing, animations
- Component layout and appearance
- Content text, images, SVGs
- Icons and visual elements
- Navigation links and routing logic (NEW ROUTES only)

**Example:** Adding a new home screen section, changing button colors, modifying splash screen text.

---

## RULE 2: Do NOT Modify Capacitor Configuration

❌ Do NOT change `capacitor.config.ts`

This file controls:
- `appId` - Package identifier
- `appName` - Display name
- `webDir` - Critical: points Capacitor to web assets

**Why:** Incorrect webDir causes asset loading failures and white screen.

**Exception:** Only if explicitly instructed to change package ID or app name for release.

---

## RULE 3: Do NOT Modify Vite Build Configuration

❌ Do NOT change `vite.config.ts`

This file controls:
- SPA mode (required for Capacitor)
- Base path (must be `./` for WebView)
- Code-splitting (disabled intentionally)
- Build output directory

**Why:** Vite configuration changes break Capacitor integration or asset loading.

**Exception:** Only if explicitly instructed to add a new Vite plugin or change build strategy.

---

## RULE 4: Do NOT Change Production Output Directory

❌ Do NOT modify build output paths

Current: `dist/client/` → Must stay as is

The following MUST NOT be changed:
- Vite output directory
- Capacitor `webDir`
- Android asset paths
- Build script output

**Why:** Capacitor and Android build rely on these paths being consistent.

---

## RULE 5: Do NOT Remove or Rename index.html

❌ Do NOT delete, move, or rename `dist/client/index.html`

❌ Do NOT change `wrap-html.mjs` core logic

This file is the entry point for the entire application in Android WebView.

**Why:** Without it, the app has no way to load.

**OK:** Modifying HTML metadata (title, description, meta tags) is allowed.

---

## RULE 6: Do NOT Change React Entry-Point Configuration

❌ Do NOT modify these files casually:
- `src/start.ts` - TanStack Start initialization
- `src/router.tsx` - Router creation
- `src/routes/__root.tsx` - Root layout

**Why:** These control how React boots and renders. Changes can prevent app startup.

**OK:** Adding logging statements is acceptable.
**OK:** Adding error handling is acceptable.
**Exception:** Only change routing infrastructure if explicitly instructed.

---

## RULE 7: Do NOT Change Routing Infrastructure While Making Unrelated Changes

❌ Bad: "I'll add a new button AND refactor the router"

✅ Good: "I'll add a new button" (separate task)
✅ Good: "I'll refactor the router" (separate task with testing)

**Why:** Multiple infrastructure changes make it harder to identify what caused a white screen.

**Approach:** One concern per commit. Build + test between each.

---

## RULE 8: Do NOT Change Dependency Versions Arbitrarily

❌ Do NOT upgrade packages unless explicitly required

❌ Do NOT change `package.json` versions casually

Current versions in `package.json` are tested and working:
- `@tanstack/react-start`
- `@tanstack/react-router`
- `vite`
- `react`
- `tailwindcss`

**Why:** Dependency changes require full build + Android testing.

**If a dependency must be upgraded:**

1. **Explicitly state the reason** (bug fix, security, new feature)
2. **Test thoroughly:**
   - `npm run build`
   - `npx cap sync android`
   - `./gradlew clean assembleDebug`
   - Device testing
3. **Create a separate commit** for the upgrade
4. **Document why** in the commit message

---

## RULE 9: Do NOT Modify Android Configuration for Web UI/Content Changes

❌ Do NOT change files in `android/`:
- `build.gradle`
- `app/build.gradle`
- `app/src/main/AndroidManifest.xml`
- `app/src/main/java/...`
- Gradle plugins
- Android SDK configurations

**Why:** Android changes require Gradle rebuild and testing.

**Exception:** Only if explicitly instructed for app signing, versioning, or permissions.

---

## RULE 10: Every Change Must Preserve Build Integrity

Every modification must preserve:

```bash
npm run build                    # Must complete successfully
npx cap sync android             # Must complete successfully
npm run validate:android         # Must pass all checks
```

**After ANY change:**

1. Run `npm run build`
2. Run `npx cap sync android`
3. Rebuild Android APK
4. Install on device
5. Verify no white screen

**If build fails:** REVERT the change immediately.

---

## RULE 11: Do NOT Introduce Breaking Changes to Routes

❌ Do NOT delete existing routes without migration

❌ Do NOT change route paths in __root.tsx

✅ OK: Add new routes
✅ OK: Add new pages
✅ OK: Modify component content within routes

**Why:** Route changes can break navigation and cause app navigation failures.

**If a route must be deleted:**
1. Add a redirect from old path to new path
2. Gradually deprecate the old route
3. Test all navigation paths

---

## RULE 12: Environment Variables Must Have Safe Defaults

❌ Do NOT require environment variables that don't have fallbacks

✅ OK: Optional environment variables with fallback values

Example:
```typescript
const apiUrl = process.env.VITE_API_URL || 'https://default-api.com';
```

**Why:** Production builds must work without explicit environment setup.

---

## RULE 13: Do NOT Use Browser-Only APIs During Startup

❌ Do NOT access `window`, `document`, `localStorage` during module import

✅ OK: Use browser APIs inside React components (useEffect, handlers)

**Why:** Some build tools and SSR contexts don't have `window` defined, causing startup crashes.

**Safe pattern:**
```typescript
// ✅ SAFE - Inside useEffect
useEffect(() => {
  const data = localStorage.getItem('key');
}, []);

// ❌ UNSAFE - At module level
const data = localStorage.getItem('key');
```

---

## RULE 14: CSS Changes Must Be Tested in Production Build

❌ Do NOT assume Tailwind classes work without rebuild

✅ After adding new Tailwind utilities:
1. Run `npm run build`
2. Verify CSS is in `dist/client/assets/styles-*.css`
3. Test on Android

**Why:** Tailwind CSS is optimized during build. Dev mode classes may not appear in production.

---

## RULE 15: Do NOT Change the Package ID

❌ Do NOT modify `appId` in `capacitor.config.ts`:
```typescript
appId: 'com.indiaexplorer.app'  // DO NOT CHANGE
```

**Why:** Package ID is tied to app signing and Google Play registration.

**Exception:** Only if explicitly preparing for release with a new package ID, which requires full testing and signing.

---

## SUMMARY: What Requires Approval

| Change Type | Approval | Testing |
|------------|----------|---------|
| UI/styling | ✅ None | `npm run build` |
| New route/page | ✅ None | `npm run build` + device |
| New component | ✅ None | `npm run build` + device |
| Content text | ✅ None | `npm run build` |
| Vite config | 🔴 REQUIRED | Full build + device |
| Capacitor config | 🔴 REQUIRED | Full build + device + resign |
| Android config | 🔴 REQUIRED | Full build + device |
| package.json | 🔴 REQUIRED | Full build + device |
| Routing infrastructure | 🟡 CAREFUL | Full build + device |
| TypeScript config | 🟡 CAREFUL | Full build + device |

---

## Validation Script

Before each deployment, run:

```bash
npm run validate:android
```

This script checks:
- ✅ Build succeeded
- ✅ index.html exists
- ✅ All assets exist
- ✅ No broken references
- ✅ Capacitor config is valid
- ✅ Android assets synced

If validation fails, review changes and revert if needed.

---

## Rollback Procedure

If a change breaks the build:

1. **Identify the breaking change**
   ```bash
   git log --oneline -n 10
   ```

2. **Revert the change**
   ```bash
   git revert <commit-hash>
   ```

3. **Rebuild and test**
   ```bash
   npm run build
   npx cap sync android
   npm run validate:android
   ```

4. **Fix properly**
   - Understand what broke
   - Make a minimal fix
   - Test thoroughly before committing

---

## Release Checklist

Before building for release:

- [ ] All tests pass
- [ ] `npm run build` succeeds
- [ ] No console errors
- [ ] `npm run validate:android` passes
- [ ] App launches on device
- [ ] No white screen
- [ ] All navigation works
- [ ] Images load correctly
- [ ] Fonts load correctly
- [ ] No performance issues

---

## Questions?

If you're unsure whether a change is safe:

1. **Check this document first**
2. **Review BUILD-CONTRACT.md**
3. **If still unsure, test in a separate branch:**
   ```bash
   git checkout -b test/my-change
   # Make the change
   npm run build
   npx cap sync android
   # Test on device
   # If it works, proceed; if not, revert
   ```

---

**Version:** 1.0  
**Last Updated:** August 2026  
**Framework:** React 19 + TanStack Start + Capacitor 6 + Vite 8  
**Target Platform:** Android (WebView)
