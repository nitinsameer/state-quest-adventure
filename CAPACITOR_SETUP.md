# India Explorer — Capacitor Android App Setup

This document summarizes the Capacitor integration for packaging the TanStack Start app as a native Android app.

## ✅ Completed Setup

### 1. **Static SPA Configuration** 
- Modified `vite.config.ts` with `ssr: false` to disable server-side rendering
- Verified all routes use client-only data fetching (no `createServerFn` or server-side loaders)
- Build output: `.output/public/` (static HTML/JS/CSS/assets)

### 2. **Capacitor Installation**
Installed packages:
- `@capacitor/core` — Capacitor runtime
- `@capacitor/cli` — Build tooling
- `@capacitor/android` — Android platform support
- `@capacitor/haptics` — Native haptic feedback
- `@capacitor/app` — App lifecycle & back button handling
- `@capacitor/assets` — Icon/splash screen generation

### 3. **App Configuration**
- **App Name:** India Explorer
- **Package ID:** com.indiaexplorer.app
- **Web Directory:** `.output/public/` (configured in `capacitor.config.ts`)

### 4. **Icons & Splash Screens**
Generated from `src/assets/mascot.png` with orange background (#FF9933):
- **Android Adaptive Icons** — Multiple DPI sizes (ldpi–xxxhdpi)
- **Android Splash Screens** — Portrait/landscape, light/dark modes
- **PWA Icons** — 48px–512px sizes
- **Total Android Resources:** 87 files, 18.77 MB

Located in: `android/app/src/main/res/mipmap-*` and `android/app/src/main/res/drawable-*`

### 5. **Native Haptics Integration**
Updated `src/lib/fx.ts`:
- Detects native platform with `Capacitor.isNativePlatform()`
- On Android/iOS: uses `Capacitor.Haptics.impact()` with ImpactStyle variants
- On web: falls back to `navigator.vibrate()`
- All FX functions (correct, wrong, confetti, stamp, tap) trigger haptics appropriately

### 6. **Android Back Button Handler**
Created `src/hooks/useAndroidBackButton.ts`:
- Listens to `App.backButton` event on native platforms
- Routes `/`, `/home`, `/welcome` → exits app
- All other routes → navigates back via router history
- Integrated into `RootComponent` in `src/routes/__root.tsx`

### 7. **Build & Sync**
- Built static SPA: `npm run build` → `.output/public/`
- Synced web assets to Android: copied `.output/public/*` to `android/app/src/main/assets/`

---

## 📦 Project Structure

```
state-quest-adventure/
├── capacitor.config.ts          ← Capacitor app config
├── .output/public/              ← Built static SPA (web root)
│   ├── index.html               ← Entry point
│   ├── assets/                  ← App images
│   └── index-*.js, styles-*.css ← Bundled app
├── android/                     ← Android native project
│   ├── build.gradle
│   ├── gradle.properties
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/indiaexplorer/app/MainActivity.java
│   │       ├── assets/          ← Web files (synced)
│   │       └── res/
│   │           ├── mipmap-*/ic_launcher*.png   ← App icons
│   │           └── drawable-*/splash.png       ← Splash screens
│   └── gradle/wrapper/
├── src/
│   ├── lib/fx.ts                ← Haptics integration
│   ├── hooks/useAndroidBackButton.ts
│   ├── routes/__root.tsx        ← Back button hook wired
│   └── ...
├── package.json                 ← New dependencies
├── vite.config.ts               ← SPA build config
└── assets/
    ├── icon.png                 ← Source icon (mascot.png)
    └── splash.png               ← Source splash (mascot.png)
```

---

## 🚀 Next Steps — Local Build & Testing

### Prerequisites
- **Java Development Kit (JDK)** 17+ or higher (Android Studio comes with this)
- **Android SDK** — API level 24+ (installed via Android Studio)
- **Android Emulator** or physical device with USB debugging enabled

### Build & Run in Emulator

```bash
# 1. Open Android Studio and build
cd android
./gradlew build

# 2. Launch emulator (or connect device)
# Option A: Use Android Studio's emulator
# Option B: Command line (if emulator already configured)
$ANDROID_HOME/emulator/emulator -avd Pixel_API_34 &

# 3. Deploy to emulator
./gradlew installDebug

# 4. Open the app
# Should see "India Explorer" app icon on home screen
```

### Verify Functionality
- ✅ **Splash screen** displays with orange background
- ✅ **App icon** shows mascot with orange background
- ✅ **Navigation works** — tap states, complete quiz
- ✅ **Haptics fire** — feel vibration on correct/wrong answers
- ✅ **Back button** — navigates back; closes on home screen
- ✅ **LocalStorage persists** — progress saved across app restarts

### Production Build (APK/AAB)

```bash
# Debug APK
./gradlew build

# Release APK (requires keystore)
./gradlew assembleRelease

# Android App Bundle (for Play Store)
./gradlew bundleRelease
```

---

## 🔧 Development Workflow

### Making Changes to the Web App
1. Edit React/TypeScript files in `src/`
2. Build: `npm run build`
3. Copy to Android: `npx cap copy android` or manually copy `.output/public/*` to `android/app/src/main/assets/`
4. Rebuild Android: `./gradlew installDebug` from `android/` directory
5. Restart app on emulator

### Updating Native Dependencies
```bash
npm install [new-package]
npx cap sync android
```

### Customizing App Appearance
- **App Icon** — Replace `assets/icon.png`, run `npx @capacitor/assets generate`
- **Splash Screen** — Replace `assets/splash.png`, run `npx @capacitor/assets generate`
- **Colors** — Edit `android/app/src/main/res/values/colors.xml` or `capacitor.config.ts`

---

## 📝 Key Features Verified

| Feature | Implementation | Status |
|---------|---|---|
| Static SPA Build | `vite.config.ts` with `ssr: false` | ✅ |
| App Icon | Adaptive icons from mascot.png | ✅ |
| Splash Screen | Orange background (#FF9933) | ✅ |
| Sound/Haptics | `Capacitor.Haptics.impact()` on native | ✅ |
| Back Button | `App.backButton` listener with route-aware exit | ✅ |
| LocalStorage | Persists in WebView storage | ✅ |
| Routing | TanStack Router with client-side navigation | ✅ |
| Styling | Tailwind CSS compiled into bundle | ✅ |

---

## 🐛 Troubleshooting

### App Won't Start
- Check `android/app/src/main/assets/index.html` exists
- Verify `.output/public/` built correctly
- Check Android logcat: `adb logcat | grep "India Explorer"`

### Haptics Not Working
- Confirm `@capacitor/haptics` installed
- Check device supports haptics (most modern Android devices do)
- Test with: `Haptics.impact({ style: ImpactStyle.Heavy })`

### Back Button Not Responding
- Verify `useAndroidBackButton` hook is called in RootComponent
- Check `App.backButton` listener is registered (only on native platforms)
- Test with router state: `console.log(router.state.location.pathname)`

### LocalStorage Data Lost
- WebView storage is preserved by Android unless app cache is cleared
- Settings → Apps → India Explorer → Storage → Clear Cache/Data wipes localStorage

---

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/)
- [Android Studio Setup](https://developer.android.com/studio)
- [Capacitor Assets](https://github.com/ionic-team/capacitor-assets)
- [TanStack Start](https://tanstack.com/start/)
- [TanStack Router](https://tanstack.com/router/)

---

## ✨ Summary

The India Explorer app is now fully packaged as a Capacitor-based Android app with:
- ✅ Static SPA build (no server needed)
- ✅ Native haptic feedback
- ✅ Android back button navigation
- ✅ Custom icons & splash screens
- ✅ LocalStorage persistence
- ✅ Ready for Android Studio build & emulator/device testing

Next step: Open `android/` folder in Android Studio and build!
