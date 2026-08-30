# Build Scripts

Two scripts are provided for clean builds without Gradle cache issues.

## Quick Start

### Debug Build (Install on Device)
```powershell
.\build-and-install.ps1
```
- Cleans `dist/` folder
- Builds web assets with `npm run build`
- Syncs to Android with `npx cap sync android`
- Runs `gradlew clean` to clear Gradle cache
- Builds debug APK
- Uninstalls old version
- Installs new APK on connected device
- Launches app

**Time:** ~3-4 minutes

### Release Build (AAB for Play Store)
```powershell
.\build-and-install.ps1 -Release
```
- Cleans `dist/` folder
- Builds web assets with `npm run build`
- Syncs to Android
- Runs `gradlew clean`
- Builds release AAB (signed with word-wizard.jks)
- Output: `android/app/build/outputs/bundle/release/app-release.aab`

**Time:** ~4-5 minutes

---

## What These Scripts Do

### Problem They Solve
When you make code changes (especially in React/TypeScript), Gradle caches old assets. The app shows the old version even after rebuild.

**Why:** Gradle's build cache keeps old compiled files. `npx cap sync` copies new web assets, but if Gradle hasn't invalidated its cache, the APK still contains old assets.

### Solution
1. Delete `dist/` folder (old web build)
2. Run `npm run build` (create fresh web build)
3. Run `npx cap sync android` (copy new assets to Android)
4. Run `gradlew clean` (clear Gradle cache)
5. Build APK/AAB (uses fresh assets)
6. Install and launch

---

## When to Use

- **After every code change** (especially UI/screens changes)
- **When app shows old content after rebuild**
- **When new features don't appear in app**
- **When you switch between debug/release builds**

---

## Manual Steps (if not using script)

```powershell
# Debug build
npm run build
npx cap sync android
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug
adb uninstall com.nishaantech.exploreindia
adb install app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.nishaantech.exploreindia/.MainActivity

# Release build
npm run build
npx cap sync android
cd android
.\gradlew.bat clean
.\gradlew.bat bundleRelease
# Upload app-release.aab to Google Play Console
```

---

## Output Files

After running scripts:

- **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk` (installed on device)
- **Release:** `android/app/build/outputs/bundle/release/app-release.aab` (for Play Store)

---

## Troubleshooting

### APK still shows old content
- Kill app: `adb shell am force-stop com.nishaantech.exploreindia`
- Clear app data: `adb shell pm clear com.nishaantech.exploreindia`
- Rerun script

### Build hangs
- Gradle sometimes takes time
- Wait 5-10 minutes
- If still stuck: `Ctrl+C` and rerun

### ADB not found
- Add Android SDK to PATH
- Or use full path: `C:\Users\nitin\AppData\Local\Android\Sdk\platform-tools\adb.exe`

### No device connected
- Check: `adb devices`
- Enable USB debugging on phone
- Connect USB cable

---

## Configuration

Scripts use these settings (hardcoded):
- **App package:** `com.nishaantech.exploreindia`
- **Project root:** `d:\NishaanTech\state-quest-adventure`
- **Signing:** `word-wizard.jks` (for release)

To change, edit the script variables at the top.
