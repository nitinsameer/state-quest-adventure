# Golden Path Test Script
# This will guide the app through a complete flow and log all key events

# Step 1: Clear app data
adb shell pm clear com.getcapacitor.myapp
Start-Sleep -Seconds 2

# Step 2: Launch app
adb shell am start -n com.getcapacitor.myapp/.MainActivity
Start-Sleep -Seconds 3

# Step 3: Start monitoring logcat for key events
Write-Output "
=== STARTING LOGCAT MONITORING ===
"
adb logcat | Select-String -Pattern "firebaseEvents|progress|reward|XP|badge" &
$logcatPid = $?

Start-Sleep -Seconds 1
Write-Output "
=== STEP 1: ONBOARDING - Avatar Selection ===
"
# Tap on first avatar
adb shell input tap 540 400
Start-Sleep -Seconds 1

# Next button
adb shell input tap 540 800
Start-Sleep -Seconds 1

Write-Output "
=== STEP 2: Age Band Selection ===
"
# Tap on age band button
adb shell input tap 540 400
Start-Sleep -Seconds 1

# Select age band
adb shell input tap 540 500
Start-Sleep -Seconds 1

Write-Output "
=== STEP 3: Navigate to Home ===
"
Start-Sleep -Seconds 2

# Get localStorage state
Write-Output "
=== CHECKING PROGRESS STATE AFTER ONBOARDING ===
"
adb shell 'dumpsys meminfo com.getcapacitor.myapp | grep -i progress'

