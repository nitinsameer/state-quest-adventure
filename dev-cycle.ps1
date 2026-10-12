#!/usr/bin/env pwsh
# Development cycle script: sync, build, uninstall, and install APK on Android device

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipSync = $false,
    [switch]$DevMode = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-Status {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
    Write-Host $Message -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor $Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "X $Message" -ForegroundColor $Red
}

try {
    Write-Status "Starting development cycle..."
    
    # Step 1: Build
    if (-not $SkipBuild) {
        Write-Status "Building web app..."
        if ($DevMode) {
            npm run build:dev
        } else {
            npm run build
        }
        Write-Success "Web app built"
    } else {
        Write-Status "Skipping build"
    }
    
    # Step 2: Sync with Capacitor
    if (-not $SkipSync) {
        Write-Status "Syncing with Capacitor..."
        npx cap sync android
        Write-Success "Capacitor sync complete"
    } else {
        Write-Status "Skipping Capacitor sync"
    }
    
    # Step 3: Build Android APK
    Write-Status "Building Android APK..."
    & ".\android\gradlew.bat" -p ".\android" build
    Write-Success "Android APK built"
    
    # Step 4: Uninstall existing app
    Write-Status "Uninstalling existing app from device..."
    adb uninstall com.nishaantech.statequest
    Write-Success "App uninstalled"
    
    # Step 5: Install new APK
    Write-Status "Installing new APK on device..."
    $apkPath = Get-ChildItem -Path ".\android\app\build\outputs\apk\release\*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (-not $apkPath) {
        $apkPath = Get-ChildItem -Path ".\android\app\build\outputs\apk\debug\*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    
    if ($apkPath) {
        adb install "$($apkPath.FullName)"
        Write-Success "App installed: $($apkPath.Name)"
    } else {
        Write-Error-Custom "APK file not found in build outputs"
        exit 1
    }
    
    Write-Success "Development cycle complete!"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor $Yellow
    Write-Host "1. Unlock your device"
    Write-Host "2. Launch 'State Quest Adventure' from your app drawer"
    Write-Host "3. Open Chrome DevTools: adb forward tcp:8081 tcp:8081"
    
} catch {
    Write-Error-Custom "Development cycle failed: $($_.Exception.Message)"
    exit 1
}
