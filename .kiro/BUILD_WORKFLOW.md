# Build & Install Workflow

**Standard procedure for every feature implementation:**
**INSTALLATION IS AUTOMATIC - Required for on-device testing**

## Quick Commands

```bash
# Build + Automatic Install to Device (RECOMMENDED)
npm run build:clean

# Build + Automatic Install with Verbose Output
npm run build:clean -- --verbose

# Build Only (Skip Installation)
npm run build:no-install

# Standard Build (Legacy - no cleanup)
npm run build
```

## Workflow Steps

### 1. Clear Build Artifacts
Removes dist directory and any stale build cache to ensure clean build.

```bash
rm -r dist/
```

**Why**: Prevents stale code from being included in production bundle

**When**: After every feature implementation

### 2. Run Production Build
Executes full Vite build pipeline with all optimizations.

```bash
npm run build
```

**What it does:**
- Transpiles TypeScript → JavaScript
- Tree-shakes unused code
- Minifies and optimizes
- Generates source maps
- Copies assets to Android

**Expected output**:
- ✓ Client build: ~2.2MB (uncompressed)
- ✓ Server build: ~2MB (uncompressed)
- ✓ APK generated: ~50-100MB (debug)
- ✓ Assets copied to Android

### 3. Verify Build Artifacts
Checks that all required files were created.

```bash
ls -la dist/client/
ls -la dist/server/
ls -la android/app/build/outputs/apk/debug/
```

**Expected files**:
- ✓ `dist/client/index.html` - Entry point
- ✓ `dist/client/assets/*.js` - JavaScript bundles
- ✓ `dist/client/assets/*.css` - Stylesheets
- ✓ `dist/server/server.js` - Server bundle
- ✓ `android/app/build/outputs/apk/debug/app-debug.apk` - APK

### 4. Automatic Installation to Device
🔴 **AUTOMATIC BY DEFAULT** - No extra step needed!

Installation is handled automatically:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Prerequisites**:
- ✓ Android SDK configured
- ✓ Device/emulator connected via USB or Emulator running
- ✓ USB debugging enabled (for physical devices)

**Verify installation**:
```bash
adb shell pm list packages | grep "state.quest"
```

## Complete Workflow Script

Use `npm run build:clean` for the complete automated workflow:

```bash
npm run build:clean                      # Clean build + auto install (RECOMMENDED)
npm run build:clean -- --verbose         # With detailed output
npm run build:clean -- --no-install      # Build only (skip install)
npm run build:clean -- --verbose --no-install  # Verbose build only
```

## Pre-Installation Checklist

Before running `npm run build:clean`:

✅ **Device/Emulator is running**
```bash
adb devices
# Should show one or more devices/emulators
```

✅ **USB debugging is enabled** (for physical devices)
- Settings → Developer Options → USB Debugging: ON

✅ **Android SDK is configured**
```bash
android --version
# Should show SDK version
```

## Troubleshooting

### Build Fails with TypeScript Error
1. Check syntax in modified files
2. Verify type imports are correct
3. Run: `npm run build:clean -- --verbose`

### APK Not Generated
1. Check Android SDK is configured
2. Verify Gradle setup: `cd android && ./gradlew --version`
3. Run: `npm run validate:android`

### Installation Fails - Device Not Found
1. Connect device via USB
2. Enable USB Debugging in Developer Options
3. Run: `adb devices` to verify connection
4. Retry: `npm run build:clean`

### Installation Fails - "Application already installed"
1. App is already on device (this is normal)
2. It will be reinstalled with the new version
3. Check installation was successful:
   ```bash
   adb shell pm list packages | grep "state.quest"
   ```

### Device Connection Issues

```bash
# List connected devices
adb devices

# If no devices:
adb kill-server
adb start-server
adb devices

# For physical device:
# - Check USB cable connection
# - Enable USB Debugging in Developer Options
# - Select "Always Allow" when prompt appears

# For emulator:
# - Ensure Android Emulator is running
# - Check in Device Manager
```

## Size Concerns
- Debug APK: ~50-100MB (normal, includes debugging symbols)
- Release APK: ~20-30MB (after minification)
- Check bundle: `npm run build && npm run preview`

## Performance Tips

### Faster Rebuilds During Development
```bash
npm run dev              # Hot reload dev server (no install needed)
npm run build:dev       # Dev build (no minification)
npm run build:no-install # Build without installation
```

### Faster Installs
```bash
# If you just want to rebuild without install:
npm run build:no-install

# Then manually install when needed:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Validation Checklist

After each `npm run build:clean`:

- [ ] Build completes with 0 errors
- [ ] All TypeScript types check out
- [ ] APK generated (file exists)
- [ ] Installation succeeds (no errors in output)
- [ ] App launches on device/emulator
- [ ] Features work as expected
- [ ] No console errors in DevTools

## Standard Development Workflow

### Quick Iteration (No Install)
```bash
npm run dev                      # Hot reload for instant feedback
npm run build:no-install         # Build without install
```

### Ready for Testing on Device
```bash
npm run build:clean              # Build + Auto-install everything
# App appears on device automatically
```

### Deployment Ready
```bash
npm run build:clean -- --verbose # Full output for verification
npm run test                     # Run test suite
npm run lint                     # Check code quality
```

## CI/CD Integration

For automated builds and installations:

```bash
npm run build:clean              # Full build + install
npm run validate:android         # Validate Android config
npm run test                     # Run test suite
npm run lint                     # Check code quality
```

## File Paths Reference

| Purpose | Path |
|---------|------|
| Build output (client) | `dist/client/` |
| Build output (server) | `dist/server/` |
| Android APK (debug) | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Android assets | `android/app/src/main/assets/public/` |
| Source TypeScript | `src/` |
| Build scripts | `scripts/` |

## Next Steps After Installation

Once `npm run build:clean` completes:

1. **App launches automatically** on device/emulator
2. **Test the app** - Verify all features work
3. **Check performance** - Monitor memory, CPU
4. **Review errors** - Check browser console and logcat
5. **Commit changes** - Only after verification
6. **Document changes** - Add to changelog

---

**Remember**: 
- **Always use `npm run build:clean` for feature implementations**
- **Installation happens automatically**
- **Device must be connected and USB Debugging enabled**
- **Check `adb devices` if installation fails**
