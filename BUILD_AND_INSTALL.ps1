# India Explorer - Build and Install for Android
# Run this script on your Windows machine

Write-Host "" -ForegroundColor White
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "India Explorer - Android Build" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# Check if device is connected
Write-Host "Checking connected devices..." -ForegroundColor Yellow
adb devices
Write-Host "" -ForegroundColor White

# Navigate to android folder
Set-Location android

# Run the build command
Write-Host "Starting build and install..." -ForegroundColor Yellow
Write-Host "This will take 5-10 minutes on first build." -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

.\gradlew.bat clean assembleDebug installDebug

# Check if successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "" -ForegroundColor White
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "✓ Build successful!" -ForegroundColor Green
    Write-Host "Check your device for the app." -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
} else {
    Write-Host "" -ForegroundColor White
    Write-Host "====================================" -ForegroundColor Red
    Write-Host "✗ Build failed! Check errors above." -ForegroundColor Red
    Write-Host "====================================" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
