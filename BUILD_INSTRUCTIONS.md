# India Explorer — Android Build Instructions

## Status
✅ **All Capacitor setup is complete.** The app is ready to build in Android Studio or via command line with proper internet connectivity.

## What's Been Completed
- ✅ Static SPA build (`npm run build` → `.output/public/`)
- ✅ Capacitor Android platform initialized
- ✅ App icons and splash screens generated (orange theme)
- ✅ Native haptics plugin integrated
- ✅ Android back button handler wired
- ✅ Web assets synced to `android/app/src/main/assets/`
- ✅ Android project structure fully configured

## Build Methods

### Method 1: Android Studio (Recommended)
**Best for local development and testing.**

1. **Open Android Studio**
2. **File → Open** → Select the `android/` folder from this project
3. Wait for Gradle sync to complete (requires internet to download dependencies)
4. **Build → Make Project** (or Ctrl+F9)
5. **Run → Run 'app'** to install and launch on emulator/device

### Method 2: Command Line (with Gradle Wrapper)
**Requires internet connectivity for first-time setup.**

```bash
cd android

# Clean and assemble debug APK
./gradlew clean assembleDebug

# Install on connected emulator/device
./gradlew installDebug

# Or do both in one command
./gradlew clean assembleDebug installDebug
```

**Windows:**
```bash
cd android
.\gradlew.bat clean assembleDebug installDebug
```

### Method 3: Offline Build (if Gradle already cached)
If Gradle was previously downloaded and cached:
```bash
./gradlew --offline clean assembleDebug installDebug
```

## Prerequisites for Building

### Required
1. **Java Development Kit (JDK) 17+**
   - Android Studio bundles JDK 17
   - Or install separately: https://www.oracle.com/java/technologies/downloads/

2. **Android SDK**
   - Download via Android Studio SDK Manager
   - Minimum API level 24 (most devices)
   - Recommended: API 34+

3. **Internet Connection** (first build only)
   - Gradle wrapper downloads ~200MB of dependencies
   - Subsequent builds can run offline with `--offline` flag

### Optional
- **Android Emulator** (built into Android Studio)
- **Physical Android Device** with USB debugging enabled

## Network Issues During Build?

If you get timeout errors downloading Gradle:

1. **Check internet connection** — Required for first build
2. **Increase timeout** in `android/gradle/wrapper/gradle-wrapper.properties`:
   ```properties
   networkTimeout=120000  # 2 minutes (instead of 10 seconds)
   ```

3. **Use a VPN** if services.gradle.org is blocked in your region

4. **Download Gradle manually** and place in `~/.gradle/wrapper/dists/`

## Output APK Location

After successful build:
- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK:** `android/app/build/outputs/apk/release/app-release.apk` (requires signing)

## Testing the App

### On Emulator
1. Start emulator: `emulator -avd Pixel_7_API_34` (or use Android Studio)
2. Install app: `./gradlew installDebug`
3. Open app: Tap "India Explorer" icon on home screen

### On Physical Device
1. Connect device via USB
2. Enable USB Debugging: Settings → Developer Options → USB Debugging
3. Install app: `./gradlew installDebug`
4. Open app on device

### Verify Features
- ✅ **Splash screen** displays with orange background
- ✅ **App icon** shows mascot artwork
- ✅ **App starts** and loads landing page
- ✅ **Navigation works** — tap states, routes, quiz
- ✅ **Haptics fire** — feel vibration on correct/wrong
- ✅ **Back button** — navigates back; closes on home
- ✅ **Data persists** — progress saved after restart

## Development Workflow

### Make Changes
```bash
# Edit React/TypeScript in src/
npm run build                          # Build static SPA
cp -r .output/public/* android/app/src/main/assets/
cd android
./gradlew assembleDebug installDebug   # Rebuild Android app
```

### Hot Reload (Web Only)
```bash
npm run dev  # Development server on localhost:5173
# Can test web version before building Android
```

## Production Release

### Generate Signed Release APK
```bash
cd android
./gradlew bundleRelease  # Creates Android App Bundle for Play Store
# or
./gradlew assembleRelease  # Creates standalone APK
```

Requires a signing key (generated once, then reused):
```bash
# Create keystore (first time only)
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Configure in android/app/build.gradle:
# signingConfigs { release { ... } }
```

## Troubleshooting

### Build Fails: Gradle Download Timeout
**Solution:** Increase network timeout or use offline mode if already cached.

### Build Fails: "Android SDK not found"
**Solution:** Open Android Studio, go to SDK Manager, download Android SDK (API 24+).

### App Won't Start: "Blank Screen"
**Solution:** Check `android/app/src/main/assets/index.html` exists. Verify `.output/public/` was copied.

### Haptics Not Working
**Solution:** Device must support haptics (most Android 5.0+ devices). Check with: `adb shell getprop ro.hardware`

### Back Button Not Responsive
**Solution:** Verify `useAndroidBackButton` hook is imported and called in `src/routes/__root.tsx`.

## Project Layout

```
android/
├── build.gradle              # Project config
├── gradle/wrapper/           # Gradle 8.14.3 wrapper
├── settings.gradle           # Modules
└── app/
    ├── build.gradle          # App build config
    ├── src/main/
    │   ├── AndroidManifest.xml
    │   ├── java/.../MainActivity.java
    │   ├── assets/           # Web files (.output/public/*)
    │   └── res/
    │       ├── mipmap-*/     # Icons
    │       ├── drawable-*/   # Splash screens
    │       └── values/       # Strings, colors
    └── build/outputs/apk/    # Built APKs (after build)
```

## Next Steps

1. **Open `android/` in Android Studio**
2. **Wait for Gradle sync** (first time: ~2-5 minutes, requires internet)
3. **Connect emulator or device**
4. **Build & run** → App launches in 30-60 seconds
5. **Test features** and verify haptics/back button work

---

**Build environment note:** This project was built on a Windows machine. Commands use `.\gradlew.bat` for Windows or `./gradlew` for macOS/Linux.
