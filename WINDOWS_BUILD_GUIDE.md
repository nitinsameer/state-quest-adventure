# Windows Build Guide — India Explorer Android App

## 🪟 For Windows Users Only

This guide is specific to building on **Windows 10/11**.

## ⚡ Quick Start (2 Options)

### Option 1: Double-Click Script (Easiest)

**Step 1:** Make sure your Android device is plugged in and USB debugging is enabled.

**Step 2:** Double-click one of these files:
- **`BUILD_AND_INSTALL.bat`** — Command prompt version
- **`BUILD_AND_INSTALL.ps1`** — PowerShell version (prettier output)

**Step 3:** Wait 5-10 minutes for the build to complete.

**Step 4:** Check your device for the "India Explorer" app!

### Option 2: Manual Command Line

**Step 1:** Open PowerShell or Command Prompt

**Step 2:** Navigate to the project:
```powershell
cd d:\NishaanTech\state-quest-adventure
```

**Step 3:** Run the build command:
```powershell
cd android
.\gradlew.bat clean assembleDebug installDebug
```

**Step 4:** Wait for completion (~5-10 minutes first build)

## 🔧 Prerequisites on Windows

### Required
1. **Java 17 or higher**
   ```powershell
   java -version
   ```
   If not installed: https://www.oracle.com/java/technologies/downloads/

2. **Android SDK** 
   - Install via Android Studio (recommended)
   - Or standalone: Android SDK Command-line Tools

3. **ADB (Android Debug Bridge)**
   - Comes with Android Studio
   - Or in `%ANDROID_HOME%\platform-tools\`

4. **Internet Connection**
   - For first Gradle/SDK download (~250 MB)

### Optional (Easier)
- **Android Studio** (free)
  - Download: https://developer.android.com/studio
  - Includes Java, Android SDK, and ADB

## 📱 Device Setup

### On Your Android Device

1. **Enable USB Debugging:**
   - Settings → About → Tap "Build Number" 7 times
   - Settings → Developer Options → USB Debugging → ON

2. **Connect via USB Cable**
   - Connect to your Windows computer
   - Phone may ask: "Allow USB debugging?" → Tap "Allow"

3. **Keep Device Unlocked During Build**
   - Or have PIN/pattern ready to unlock

### Verify Connection

Open PowerShell and run:
```powershell
adb devices
```

**Expected output:**
```
List of devices attached
XXXXXXXXXXXXXXX    device
```

If you see `device` (not `offline`), you're connected! ✅

## 🚀 Build Step-by-Step

### Using the Script (Easiest)

1. Right-click `BUILD_AND_INSTALL.bat` → Run as administrator
2. Or: Right-click `BUILD_AND_INSTALL.ps1` → Run with PowerShell

### Using Manual Command Line

```powershell
# Navigate to project
cd d:\NishaanTech\state-quest-adventure\android

# Start build
.\gradlew.bat clean assembleDebug installDebug

# Wait... (5-10 minutes)
# ✓ When complete, app installs automatically
```

## ⏱️ What Happens During Build

```
Downloading Gradle...        1-2 min (first time only)
Setting up Android SDK...    1-2 min (first time only)
Compiling code...            1-2 min
Building APK...              <1 min
Installing on device...      <1 min
Launching app...             Auto
────────────────────────────────────
Total:                       5-10 min (first build)
Subsequent builds:           1-2 min (cached)
```

## ✅ Success Signs

When build completes successfully, you'll see:
- ✅ `BUILD SUCCESSFUL` message
- ✅ App appears on device home screen
- ✅ App launches automatically
- ✅ Splash screen displays (orange background)
- ✅ Landing page loads

## 🧪 Test the App

After launch:
1. **Tap any state** → See details
2. **Take a quiz** → Answer 3 questions
3. **Get correct** → Feel vibration ✓
4. **Get wrong** → Feel different vibration ✓
5. **Press back button** → Navigate back ✓
6. **From home, press back** → App exits ✓
7. **Close and reopen** → Progress saved ✓

## 🐛 Troubleshooting

### Problem: Device not recognized

```powershell
# First, check connection
adb devices

# If offline or empty:
adb kill-server
adb devices

# If still not showing:
1. Unplug USB cable
2. Wait 10 seconds
3. Plug back in
4. Check phone screen for "Allow USB debugging" prompt
5. Tap "Allow"
6. Try again: adb devices
```

### Problem: "gradlew.bat not found"

Make sure you're in the `android` folder:
```powershell
cd d:\NishaanTech\state-quest-adventure\android
ls  # Should show: build.gradle, gradlew.bat, etc.
```

### Problem: Build fails - "Gradle download timeout"

```powershell
# Retry (might be network hiccup)
.\gradlew.bat clean assembleDebug installDebug

# If keeps failing, check internet connection
ipconfig  # See if you have an IP address
ping google.com  # See if internet works
```

### Problem: "Android SDK not found"

```powershell
# Install Android Studio
# Or set environment variable:
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Then retry build
.\gradlew.bat clean assembleDebug installDebug
```

### Problem: App won't launch / blank screen

```powershell
# Check device logs
adb logcat | Select-String -Pattern "error|india|crash" -Context 2

# If still blank, reinstall
adb uninstall com.indiaexplorer.app
.\gradlew.bat assembleDebug installDebug
```

### Problem: No haptics (vibration)

- Device must support haptics (all modern Android devices do)
- Check device Settings → Vibration → On
- Try restarting app

## 🎯 Build Cheat Sheet

```powershell
# Navigate to android folder
cd d:\NishaanTech\state-quest-adventure\android

# List connected devices
adb devices

# Build and install
.\gradlew.bat clean assembleDebug installDebug

# Just build (no install)
.\gradlew.bat assembleDebug

# View APK location
dir app\build\outputs\apk\debug\

# Uninstall app
adb uninstall com.indiaexplorer.app

# View device logs
adb logcat

# Clear app data
adb shell pm clear com.indiaexplorer.app
```

## 📝 Environment Setup (One-Time)

If you don't have Android development tools installed:

### Option A: Install Android Studio (Recommended)
1. Download: https://developer.android.com/studio
2. Run installer
3. Select "Android SDK" during setup
4. Android Studio auto-configures everything
5. Then use the build command

### Option B: Command-Line Setup
1. Install Java 17+: https://www.oracle.com/java/technologies/downloads/
2. Download Android SDK Tools: https://developer.android.com/tools
3. Set `ANDROID_HOME` environment variable:
   ```powershell
   $env:ANDROID_HOME = "C:\path\to\android\sdk"
   ```
4. Install SDK components via `sdkmanager`
5. Then use the build command

## 💡 Tips for Windows

1. **Use PowerShell, not Command Prompt**
   - Prettier output and better error messages
   - Right-click Windows icon → Windows Terminal / PowerShell

2. **Run as Administrator (if permission issues)**
   - Right-click script → Run as administrator

3. **If build is slow**
   - First build downloads ~250 MB (normal)
   - Subsequent builds use cache (~2 min)
   - Close unnecessary apps to free RAM

4. **Keep device unlocked**
   - During first build, keep phone unlocked
   - Or have PIN ready to unlock if prompted

5. **Check internet**
   - First build needs internet (~1-2 MB download per minute)
   - Make sure WiFi or ethernet is stable

## 🔄 Development Workflow

After first build, to update app:

```powershell
# From project root

# 1. Update React code in src/
#    (Edit files in VS Code or similar)

# 2. Build new SPA
npm run build

# 3. Go to android folder
cd android

# 4. Rebuild and reinstall
.\gradlew.bat assembleDebug installDebug

# App updates on device in ~1-2 minutes
```

## 🎉 You're Ready!

Everything needed is installed on your Windows machine. Just:

1. **Connect device**
2. **Enable USB debugging**
3. **Run the build script or command**
4. **Wait 5-10 minutes**
5. **See app on your device!**

---

## Quick Reference

| Task | Command |
|------|---------|
| Build & Install | `.\gradlew.bat clean assembleDebug installDebug` |
| Just Build | `.\gradlew.bat assembleDebug` |
| Check Devices | `adb devices` |
| View Logs | `adb logcat` |
| Uninstall | `adb uninstall com.indiaexplorer.app` |
| Clear Data | `adb shell pm clear com.indiaexplorer.app` |

---

**Next Step:** Run `BUILD_AND_INSTALL.bat` or the command above and wait for your app! 🚀
