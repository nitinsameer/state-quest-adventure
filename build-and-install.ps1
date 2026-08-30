param([switch]$Release = $false)

$projectRoot = "d:\NishaanTech\state-quest-adventure"
$androidDir = "$projectRoot\android"

Write-Host "Cleaning previous web build..." -ForegroundColor Cyan
Remove-Item -Path "$projectRoot\dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Building web assets..." -ForegroundColor Cyan
Set-Location $projectRoot
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Syncing assets to Android..." -ForegroundColor Cyan
npx cap sync android

Write-Host "Cleaning Gradle cache..." -ForegroundColor Cyan
Set-Location $androidDir
.\gradlew.bat clean

if ($Release) {
    Write-Host "Building release AAB..." -ForegroundColor Cyan
    .\gradlew.bat bundleRelease
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host "Release AAB ready." -ForegroundColor Green
} else {
    Write-Host "Building debug APK..." -ForegroundColor Cyan
    .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { exit 1 }
    
    Write-Host "Installing on device..." -ForegroundColor Cyan
    adb uninstall com.nishaantech.exploreindia
    Start-Sleep -Seconds 1
    adb install "$androidDir\app\build\outputs\apk\debug\app-debug.apk"
    if ($LASTEXITCODE -ne 0) { exit 1 }
    
    Write-Host "Launching app..." -ForegroundColor Cyan
    adb shell am start -n com.nishaantech.exploreindia/.MainActivity
    Start-Sleep -Seconds 2
}

Write-Host "BUILD COMPLETE" -ForegroundColor Green
