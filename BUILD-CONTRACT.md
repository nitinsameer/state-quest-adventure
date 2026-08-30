# Explore India - Build Contract

This document specifies the build configuration and contract for the Explore India Android application.

## Build Configuration

### Framework & Tools
- **Frontend Framework**: React 19
- **Router**: TanStack React Router
- **Build Tool**: Vite 8
- **CSS Framework**: Tailwind CSS 4
- **Mobile Framework**: Capacitor 6
- **Android Build Tool**: Gradle (Kotlin DSL)
- **Package Manager**: npm

### Required Commands

#### Web Build
```bash
npm run build
```

This command:
1. Runs Vite build with TanStack Start SPA mode
2. Generates prerendered shell at `dist/client/_shell.html`
3. Runs `wrap-html.mjs` post-build script
4. Removes async attributes from router manifest (critical for hydration)
5. Generates final `dist/client/index.html`

**Expected output:**
```
dist/client/
  ├── index.html              (Entry point)
  ├── _shell.html             (Prerendered shell)
  ├── favicon.ico
  ├── manifest.webmanifest
  └── assets/
      ├── index-XXXXXX.js     (Main bundle)
      ├── styles-XXXXXX.css   (Styles)
      ├── *.png               (Images)
      └── [other chunks]
```

#### Capacitor Sync
```bash
npx cap sync android
```

Syncs the web build to Android native assets at:
```
android/app/src/main/assets/public/
```

#### Android Build
```bash
cd android
./gradlew clean assembleDebug  # Debug build
./gradlew clean assembleRelease # Release build
```

### Configuration Files (PROTECTED)

These files control the build and must not be modified for casual UI/content changes:

| File | Purpose | Protection Level |
|------|---------|-----------------|
| `package.json` | Dependencies, build scripts | 🔴 PROTECTED |
| `vite.config.ts` | Vite build configuration, SPA mode, base path | 🔴 PROTECTED |
| `capacitor.config.ts` | Capacitor configuration, webDir | 🔴 PROTECTED |
| `wrap-html.mjs` | Post-build HTML wrapper, async attribute removal | 🔴 PROTECTED |
| `tsconfig.json` | TypeScript configuration | 🔴 PROTECTED |
| `android/build.gradle` | Gradle configuration | 🔴 PROTECTED |
| `android/app/build.gradle` | App Gradle configuration | 🔴 PROTECTED |
| `android/app/src/main/AndroidManifest.xml` | Android manifest | 🔴 PROTECTED |
| `src/router.tsx` | React Router initialization | 🟡 CAREFUL |
| `src/start.ts` | TanStack Start initialization | 🟡 CAREFUL |
| `src/routes/__root.tsx` | Root layout component | 🟡 CAREFUL |

### Capacitor Configuration

**WebDir Configuration:**
```typescript
webDir: 'dist/client'
```

This must point to the actual Vite build output directory.

**Why:** Capacitor copies this directory to Android assets. Incorrect paths cause "white screen" errors.

### SPA Mode Configuration

**Enabled:** YES

```typescript
spa: {
  enabled: true,
  maskPath: '/',
  prerender: {
    enabled: true,
    outputPath: '/_shell.html',
    crawlLinks: false,
    retryCount: 0,
  },
}
```

**Purpose:** Prerenderes the app shell for faster first load and better initial page display in WebView.

### Base Path Configuration

```typescript
base: './'
```

**Why:** Capacitor WebView loads assets from local paths. Absolute `/assets/` paths fail in WebView context.

### Critical Fixes

#### 1. Router Manifest Async Attribute (wrap-html.mjs)

**Problem:** TanStack Start embeds `async:!0` in the router manifest script, which breaks React hydration.

**Solution:** `wrap-html.mjs` removes all `async:!0` and `async:true` attributes after build.

**Never remove this fix** - it prevents white screen on app startup.

#### 2. Code-Splitting Disabled

**Configuration:**
```typescript
rollupOptions: {
  output: {
    manualChunks: undefined,  // Disables code-splitting
  },
}
```

**Why:** Single bundle simplifies Capacitor asset management and prevents missing chunk errors in WebView.

### Environment Variables

Currently **NONE** required for production build.

If environment variables are added in the future:
- Do NOT expose secrets to frontend
- Ensure fallback values exist for optional variables
- Test production build with minimal environment

### Dependency Versions

Key dependencies are locked in `package.json`:

```json
"@tanstack/react-router": "^1.170.16",
"@tanstack/react-start": "^1.168.26",
"vite": "^8.0.16",
"tailwindcss": "^4.2.1",
"react": "^19.2.0"
```

**Never arbitrarily upgrade** - test thoroughly with Android build if changed.

### Node & npm Requirements

- **Node.js**: 18+ (check `.nvmrc` if present)
- **npm**: 8+

### Asset Management

All production assets are in `dist/client/assets/` after build:

- Images: `.png`, `.jpg`, `.svg`
- Stylesheets: `.css`
- JavaScript: `.js`
- Manifests: `.json`
- Icons: `.ico`

**All paths are relative** (`./assets/...`) to support WebView loading.

### Validation Checklist

Before deployment, verify:

- [ ] `npm run build` completes successfully
- [ ] `dist/client/index.html` exists
- [ ] `dist/client/assets/index-*.js` exists (main bundle)
- [ ] `dist/client/assets/styles-*.css` exists (styles)
- [ ] No `async` attributes in embedded scripts in index.html
- [ ] `npx cap sync android` completes successfully
- [ ] `android/app/src/main/assets/public/index.html` exists
- [ ] Android assets count matches web build
- [ ] `./gradlew clean assembleDebug` completes successfully
- [ ] APK installs without errors
- [ ] App launches on device
- [ ] No white screen on startup

### Files Safe to Modify

✅ Can be modified for UI/content changes:

- `src/routes/` - Route components
- `src/components/` - UI components
- `src/assets/` - Images, SVG, static content
- `src/styles.css` - CSS and Tailwind utilities
- `src/lib/` - Logic functions (except `router.tsx`, `logger.ts`)
- Any `.tsx`, `.ts` files NOT in protected list

### Files Requiring Approval

🟡 Changes require explicit testing:

- Dependency upgrades in `package.json`
- Changes to `src/router.tsx` or `src/start.ts`
- Changes to `src/routes/__root.tsx`
- Modifications to TypeScript config
- Modifications to Tailwind config

### Files Requiring Full Rebuild & Testing

🔴 Changes require complete build + Android test:

- `vite.config.ts`
- `capacitor.config.ts`
- `wrap-html.mjs`
- `package.json` (version changes)
- `android/` directory files
- TypeScript/build configuration

---

## Troubleshooting

### White Screen on Android

Checklist:

1. Verify `dist/client/index.html` exists and is valid
2. Check `wrap-html.mjs` removed all `async:!0` attributes
3. Verify `capacitor.config.ts` webDir points to `dist/client`
4. Run `npx cap sync android` again
5. Rebuild Android APK with `./gradlew clean assembleDebug`
6. Check device logcat for JavaScript errors

### Build Fails

1. Verify `npm install` completed
2. Check `Node` version is 18+
3. Clear `node_modules/` and reinstall if needed
4. Check disk space for build artifacts

### APK Installation Fails

1. Uninstall previous version: `adb uninstall com.nishaantech.exploreindia`
2. Ensure device is connected: `adb devices`
3. Verify APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

---

**Version:** 1.0  
**Last Updated:** August 2026  
**Maintainer:** Kiro Development
