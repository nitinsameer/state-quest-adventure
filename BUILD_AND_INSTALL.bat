@echo off
REM India Explorer - Build and Install for Android

echo.
echo ====================================
echo India Explorer - Android Build
echo ====================================
echo.

REM Check if device is connected
echo Checking connected devices...
adb devices
echo.

REM Navigate to android folder
cd android

REM Run the build command
echo Starting build and install...
echo This will take 5-10 minutes on first build.
echo.

.\gradlew.bat clean assembleDebug installDebug

REM Check if successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Build successful!
    echo Check your device for the app.
    echo ====================================
) else (
    echo.
    echo ====================================
    echo Build failed! Check errors above.
    echo ====================================
)

pause
