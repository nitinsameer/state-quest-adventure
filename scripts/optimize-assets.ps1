#!/usr/bin/env powershell
# Asset Optimization Script - Convert PNG to WebP and optimize splash screens

param(
    [ValidateSet("convert", "optimize", "both")]
    [string]$Task = "both"
)

$ErrorActionPreference = "Stop"
$ASSETS_DIR = "d:\NishaanTech\state-quest-adventure\src\assets"
$SPLASH_BASE = "d:\NishaanTech\state-quest-adventure\android\app\src\main\res"
$SIZE_THRESHOLD_KB = 300

Write-Host "📦 Asset Optimization Script`n" -ForegroundColor Green

# Track results
$convertResults = @()
$totalOriginalSize = 0
$totalConvertedSize = 0

# === PART 1: Convert large PNGs to WebP ===
if ($Task -eq "convert" -or $Task -eq "both") {
    Write-Host "Phase 1: Converting PNGs > $SIZE_THRESHOLD_KB KB to WebP`n" -ForegroundColor Cyan
    
    $pngFiles = Get-ChildItem $ASSETS_DIR -Filter "*.png" | Where-Object { $_.Length -gt ($SIZE_THRESHOLD_KB * 1024) }
    
    if ($pngFiles.Count -eq 0) {
        Write-Host "No PNG files larger than $SIZE_THRESHOLD_KB KB found."
    } else {
        foreach ($file in $pngFiles) {
            $inputPath = $file.FullName
            $outputPath = $inputPath -replace '\.png$', '.webp'
            $inputSizeKB = [math]::Round($file.Length / 1024, 2)
            
            Write-Host "Converting: $($file.Name) ($inputSizeKB KB)" -ForegroundColor Yellow
            
            # Use ImageMagick to convert PNG to WebP with quality 82
            try {
                magick convert "$inputPath" -quality 82 "$outputPath"
                
                if (Test-Path $outputPath) {
                    $outputFile = Get-Item $outputPath
                    $outputSizeKB = [math]::Round($outputFile.Length / 1024, 2)
                    $savingsKB = $inputSizeKB - $outputSizeKB
                    $savingsPercent = if ($inputSizeKB -gt 0) { [math]::Round(($savingsKB / $inputSizeKB) * 100, 1) } else { 0 }
                    
                    $convertResults += @{
                        file = $file.Name
                        pngKB = $inputSizeKB
                        webpKB = $outputSizeKB
                        savingsKB = $savingsKB
                        savingsPercent = $savingsPercent
                    }
                    
                    $totalOriginalSize += $file.Length
                    $totalConvertedSize += $outputFile.Length
                    
                    Write-Host "  ✓ $($file.Name -replace '\.png$', '.webp') ($outputSizeKB KB) - saved $savingsPercent%" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ Failed to create WebP file" -ForegroundColor Red
                }
            } catch {
                Write-Host "  ✗ Error: $_" -ForegroundColor Red
            }
        }
    }
}

# === PART 2: Optimize Android splash screens (lossless) ===
if ($Task -eq "optimize" -or $Task -eq "both") {
    Write-Host "`nPhase 2: Optimizing Android splash screens (lossless)`n" -ForegroundColor Cyan
    
    $splashFiles = Get-ChildItem $SPLASH_BASE -Filter "splash.png" -Recurse
    
    if ($splashFiles.Count -eq 0) {
        Write-Host "No splash.png files found."
    } else {
        $splashResults = @()
        $totalSplashBefore = 0
        $totalSplashAfter = 0
        
        foreach ($file in $splashFiles) {
            $path = $file.FullName
            $beforeSizeKB = [math]::Round($file.Length / 1024, 2)
            $relativePath = $path -replace [regex]::Escape("$SPLASH_BASE\"), ""
            
            Write-Host "Optimizing: $relativePath ($beforeSizeKB KB)" -ForegroundColor Yellow
            
            try {
                # Create a temporary file for the optimized image
                $tempPath = "$path.tmp.png"
                
                # Use ImageMagick to re-encode PNG with optimization
                # -strip removes metadata, -quality 100 preserves lossless, -define png:compression-level=9 maximum compression
                magick convert "$path" -quality 100 -define png:compression-level=9 "$tempPath"
                
                if (Test-Path $tempPath) {
                    # Replace original with optimized
                    Remove-Item $path -Force
                    Move-Item $tempPath $path -Force
                    
                    $afterFile = Get-Item $path
                    $afterSizeKB = [math]::Round($afterFile.Length / 1024, 2)
                    $savingsKB = $beforeSizeKB - $afterSizeKB
                    $savingsPercent = if ($beforeSizeKB -gt 0) { [math]::Round(($savingsKB / $beforeSizeKB) * 100, 1) } else { 0 }
                    
                    $splashResults += @{
                        path = $relativePath
                        beforeKB = $beforeSizeKB
                        afterKB = $afterSizeKB
                        savingsKB = $savingsKB
                        savingsPercent = $savingsPercent
                    }
                    
                    $totalSplashBefore += $file.Length
                    $totalSplashAfter += $afterFile.Length
                    
                    if ($savingsPercent -gt 0) {
                        Write-Host "  ✓ Optimized to $afterSizeKB KB - saved $savingsKB KB ($savingsPercent%)" -ForegroundColor Green
                    } else {
                        Write-Host "  ✓ File size stable at $afterSizeKB KB" -ForegroundColor Green
                    }
                } else {
                    Write-Host "  ✗ Failed to optimize" -ForegroundColor Red
                }
            } catch {
                Write-Host "  ✗ Error: $_" -ForegroundColor Red
            }
        }
        
        if ($splashResults.Count -gt 0) {
            Write-Host "`n📊 Splash Screen Optimization Summary:" -ForegroundColor Cyan
            Write-Host "=" * 70
            Write-Host "Files optimized: $($splashResults.Count)"
            Write-Host "Total before: $('{0:N2}' -f ($totalSplashBefore / 1024 / 1024)) MB"
            Write-Host "Total after: $('{0:N2}' -f ($totalSplashAfter / 1024 / 1024)) MB"
            $splashSavings = $totalSplashBefore - $totalSplashAfter
            $splashSavingsPercent = if ($totalSplashBefore -gt 0) { [math]::Round(($splashSavings / $totalSplashBefore) * 100, 1) } else { 0 }
            Write-Host "Total savings: $('{0:N2}' -f ($splashSavings / 1024 / 1024)) MB ($splashSavingsPercent%)" -ForegroundColor Green
        }
    }
}

# === Summary ===
if ($convertResults.Count -gt 0) {
    Write-Host "`n📊 WebP Conversion Summary:" -ForegroundColor Cyan
    Write-Host "=" * 70
    Write-Host "Files converted: $($convertResults.Count)"
    Write-Host "Total original: $('{0:N2}' -f ($totalOriginalSize / 1024 / 1024)) MB"
    Write-Host "Total converted: $('{0:N2}' -f ($totalConvertedSize / 1024 / 1024)) MB"
    $savings = $totalOriginalSize - $totalConvertedSize
    $savingsPercent = if ($totalOriginalSize -gt 0) { [math]::Round(($savings / $totalOriginalSize) * 100, 1) } else { 0 }
    Write-Host "Total savings: $('{0:N2}' -f ($savings / 1024 / 1024)) MB ($savingsPercent%)" -ForegroundColor Green
    
    Write-Host "`nDetailed conversion results:"
    $convertResults | ForEach-Object {
        Write-Host "  $($_.file): $($_.pngKB) KB → $($_.webpKB) KB (saved $($_.savingsPercent)%)"
    }
}

Write-Host "`n✅ Asset optimization complete!" -ForegroundColor Green
