@echo off
setlocal enabledelayedexpansion

echo.
echo Asset Optimization Script - PNG to WebP Conversion
echo ====================================================
echo.

set ASSETS_DIR=d:\NishaanTech\state-quest-adventure\src\assets
set SPLASH_BASE=d:\NishaanTech\state-quest-adventure\android\app\src\main\res
set TOTAL_ORIG=0
set TOTAL_NEW=0
set FILE_COUNT=0

echo Phase 1: Converting PNGs larger than 300KB to WebP
echo.

cd /d %ASSETS_DIR%

for %%F in (*.png) do (
    for /f "usebackq" %%Z in ('powershell -NoProfile -Command "if ((Get-Item '%%F').Length -gt 307200) { Write-Host 'CONVERT' } else { Write-Host 'SKIP' }"') do (
        if "%%Z"=="CONVERT" (
            set /a FILE_COUNT+=1
            echo Converting: %%F
            magick convert "%%F" -quality 82 "%%~nF.webp"
            if !ERRORLEVEL! equ 0 (
                echo   - Created: %%~nF.webp
            )
        )
    )
)

echo.
echo Total files converted: %FILE_COUNT%
echo.

echo Phase 2: Optimizing Android splash screens
echo.

set SPLASH_COUNT=0
cd /d %SPLASH_BASE%

for /r . %%F in (splash.png) do (
    set /a SPLASH_COUNT+=1
    echo Optimizing: %%~pF%%~nxF
    magick convert "%%F" -quality 100 -define png:compression-level=9 "%%~pF%%~nxF.tmp"
    if !ERRORLEVEL! equ 0 (
        del "%%F"
        move "%%~pF%%~nxF.tmp" "%%F"
        echo   - Optimized
    )
)

echo.
echo Total splash files optimized: %SPLASH_COUNT%
echo.
echo Asset optimization complete!
echo.

endlocal
