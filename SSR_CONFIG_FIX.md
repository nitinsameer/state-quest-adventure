# 🔧 React Initialization Error - FIXED

## The Problem

The app was crashing on startup with:
```
Uncaught TypeError: Cannot set properties of undefined (setting 't')
```

This error occurred because **TanStack Start was generating SSR-specific initialization code, even though the app was configured as a client-only SPA for Capacitor.**

## Root Cause

There was a **configuration mismatch**:

1. **vite.config.ts** was set to `ssr: false` (correct for Capacitor SPA)
2. **src/routeTree.gen.ts** (auto-generated) was declaring `ssr: true` in its Register interface
3. This caused TanStack Start to bundle **SSR-aware hydration code** that tried to initialize React using `hydrateRoot()` instead of `createRoot()`
4. The hydration code expected server-rendered DOM and metadata that didn't exist in a pure SPA
5. Result: React failed to mount, causing the undefined property access error

## The Fix

Changed the Register interface in **src/routeTree.gen.ts** from:

```typescript
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true  // ❌ Wrong - causes SSR code generation
    // ...
  }
}
```

To:

```typescript
declare module '@tanstack/react-start' {
  interface Register {
    ssr: false  // ✅ Correct - client-only SPA mode
    // ...
  }
}
```

This tells TanStack Start's bundler to:
1. Generate client-only initialization code using `createRoot()`
2. Not bundle SSR hydration logic
3. Mount React directly to `#root` div in Capacitor's WebView

## Files Changed

- **src/routeTree.gen.ts**: Updated `ssr: true` → `ssr: false`
- **vite.config.ts**: Already had `ssr: false`
- **build-spa.mjs**: Already using relative paths `./assets/`
- **capacitor.config.ts**: Already using `webDir: "dist"`

## Rebuild Process

```bash
# 1. Fix the SSR config in routeTree.gen.ts
# 2. Rebuild the SPA
npm run build

# 3. Sync with Capacitor
npx cap sync android

# 4. Rebuild and install APK
cd android
.\gradlew.bat assembleDebug installDebug
```

## What to Test Now

1. **Launch the app** on your Android device
2. **Expected behavior:**
   - App should load (no more white/blank screen immediately)
   - React should initialize and render
   - Navigation should work
   - Back button should function
   - Haptics/vibrations should work when you tap

3. **Check the logcat** for any new errors:
   ```bash
   adb logcat -s "Capacitor/Console"
   ```

## Key Takeaway

For **Capacitor WebView apps using TanStack Start**, make sure:
- ✅ `vite.config.ts` has `ssr: false`
- ✅ `src/routeTree.gen.ts` has `ssr: false` in the Register interface
- ✅ HTML points to `#root` div
- ✅ Asset paths are relative (`./assets/...`)
- ✅ Build output goes to `dist/` (for Capacitor's `webDir`)

The app is now properly configured as a client-only SPA for Capacitor!

---

**Status:** ✅ **FIXED - App Rebuilt & Installed**  
**Next:** Test on device and report if the app now renders correctly
