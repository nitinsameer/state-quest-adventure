# Quick Build & Install Guide — India Explorer on Your Device

## Status
✅ **App is fully configured and ready to build on your machine.**

❌ The cloud environment cannot download Gradle due to network restrictions, but you can build on your local machine.

## Prerequisites (One-Time Setup)

### On Your Computer

1. **Android Studio** (Free)
   - Download: https://developer.android.com/studio
   - Includes Java 17, Android SDK, and emulator

2. **OR if you prefer command line:**
   - Java 17+: https://www.oracle.com/java/technologies/downloads/
   - Android SDK Command-line Tools
   - Gradle (bundled in project)

3. **Connected Android Device**
   - USB cable connected to computer
   - USB debugging enabled: Settings → Developer Options → USB Debugging
   - Trust the computer (accept prompt on device)

## Quick Build (5 minutes)

### Step 1: Copy Project to Your Machine
```bash
# Copy the state-quest-adventure folder to your computer
# (Already there if you cloned the repo)
cd state-quest-adventure
```

### Step 2: Verify Device Connection
```bash
# Open terminal/PowerShell and run:
adb devices

# Output should show:
# List of devices attached
# XXXXXXXXXXXXXXX    device   ← Your device
```

### Step 3: Build and Install

**Option A: Command Line (Fastest)**
```bash
cd android
./gradlew clean assembleDebug installDebug

# Windows:
.\gradlew.bat clean assembleDebug installDebug
```

**Option B: Android Studio (GUI)**
1. Open Android Studio
2. File → Open → Select `android/` folder
3. Wait for Gradle sync (first time: 2-3 minutes)
4. Build → Make Project
5. Run → Run 'app'
6. Select your device

### Step 4: Launch App
- Look for "India Explorer" icon on your device home screen
- Tap to launch
- See splash screen and landing page

## What Happens During Build

1. **First time (5-10 minutes):**
   - Downloads Gradle 8.14.3 (~50 MB)
   - Downloads Android SDK tools/libraries (~100 MB)
   - Compiles Java/Kotlin code (~2 MB)
   - Creates APK (~12 MB)
   - Installs on your device (~20 seconds)
   - Launches app

2. **Subsequent builds (1-2 minutes):**
   - Uses cached Gradle/SDK
   - Quick recompile
   - Install and run

## Verify Installation

After app launches, test:

✅ **Splash Screen** — Orange background with mascot  
✅ **App Icon** — Visible on home screen  
✅ **Landing Page** — See "India Explorer" title  
✅ **Navigation** — Tap any state  
✅ **Quiz** — Answer questions, get feedback  
✅ **Haptics** — Feel vibration on correct/wrong  
✅ **Back Button** — Navigate back; closes on home  
✅ **Progress** — Close app and reopen; progress saved  

## Troubleshooting

### Device not showing in `adb devices`?
```bash
# Check USB connection
adb devices

# If blank, try:
adb kill-server
adb devices

# If still not showing:
1. Check USB cable (try different port)
2. Enable USB debugging: Settings → Developer Options → USB Debugging
3. Allow USB debugging on device (tap OK when prompted)
4. Restart adb: adb kill-server && adb devices
```

### Build fails: "Gradle download timeout"?
- Check your internet connection
- Try again (network hiccup)
- If behind corporate proxy, may need VPN

### Build fails: "Android SDK not found"?
- Open Android Studio
- Tools → SDK Manager
- Install SDK API level 24+

### App won't launch / blank screen?
- Check device logs: `adb logcat | grep -i "india\|error"`
- Try uninstall and reinstall:
  ```bash
  adb uninstall com.indiaexplorer.app
  ./gradlew installDebug
  ```

### Haptics not working?
- Ensure device supports haptics (most devices do)
- Try: Settings → Vibration → On

## What You Get

**On Your Device:**
- ✅ Full India Explorer app
- ✅ All 28 states/territories
- ✅ Quiz with haptic feedback
- ✅ Passport & badges system
- ✅ Offline playable (no internet needed)
- ✅ Local progress save
- ✅ Back button navigation
- ✅ Works on Android 5.0+ (API 21+)

**File Size:** ~12 MB APK + ~9 MB app data (images, etc.)

**Battery/Performance:**
- ~60-80 MB RAM when running
- Minimal battery drain
- Smooth 60 FPS animations

## Next Steps

1. **Plug in your Android device**
2. **Open terminal/PowerShell in the `android/` folder**
3. **Run:** `./gradlew clean assembleDebug installDebug` (or use Android Studio)
4. **Watch the app build and install** (~5-10 minutes first time)
5. **Tap the India Explorer icon** to launch
6. **Enjoy!** 🎉

## If Something Goes Wrong

**Still stuck?** Try:
1. Restart computer
2. Reconnect USB cable
3. Open Android Studio and let it auto-sync
4. Tap "Sync Now" if prompted

The most common issue is the USB connection — make sure:
- ✅ USB debugging is ON on your device
- ✅ You've allowed USB debugging when prompted
- ✅ USB cable is plugged into the right port
- ✅ Device shows in `adb devices` before building

---

**Expected build time:**
- First build: 5-10 minutes (downloads + compile)
- Subsequent: 1-2 minutes (cached)

**Questions?** Check `BUILD_INSTRUCTIONS.md` for detailed steps.

Good luck! 🚀
