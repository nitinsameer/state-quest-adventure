<#
.SYNOPSIS
  Clean + sync + build India Explorer for Android, the same way every time.

.EXAMPLE
  .\scripts\build-android.ps1 -Target debug      # dev/debug APK
  .\scripts\build-android.ps1 -Target release    # signed release APK
  .\scripts\build-android.ps1 -Target aab        # signed AAB for Play Console
  .\scripts\build-android.ps1 -Target all        # all three
  .\scripts\build-android.ps1 -Target aab -FreshInstall   # also reinstall node_modules

  Save as scripts\build-android.ps1 in the repo. Contains NO secrets.
  Signing values come from the script in -SigningScript (kept outside the repo).
#>
param(
  [ValidateSet('debug', 'release', 'aab', 'all')][string]$Target = 'aab',
  [switch]$FreshInstall,
  [switch]$Install,
  [switch]$Reinstall,
  [string]$Adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
  [string]$JavaHome = 'C:\Program Files\Java\jdk-17',
  [string]$SigningScript = 'D:\NishaanTech\Account\keys\set-signing.ps1',
  [string]$CounterFile = 'D:\NishaanTech\Account\keys\version-counter.txt',
  [string]$OutDir = 'D:\NishaanTech\Account\builds'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Run($exe, [string[]]$a) {
  & $exe @a
  if ($LASTEXITCODE -ne 0) { throw "'$exe $($a -join ' ')' failed (exit code $LASTEXITCODE)" }
}

# ---------- Preflight ----------
Step 'Preflight'
if (-not (Test-Path "$JavaHome\bin\java.exe")) { throw "JDK 17 not found at $JavaHome (use -JavaHome)" }
$env:JAVA_HOME = $JavaHome
$env:Path = "$JavaHome\bin;$env:Path"

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$hash = (git rev-parse --short HEAD).Trim()
$dirty = (git status --porcelain)
Write-Host "Branch: $branch  Commit: $hash"
if ($dirty) { Write-Host 'WARNING: uncommitted changes in the working tree.' -ForegroundColor Yellow }

if (-not (Test-Path '.env.local')) {
  Write-Host 'WARNING: .env.local missing - Firebase analytics will be OFF in this build.' -ForegroundColor Yellow
} elseif (-not (Select-String -Path '.env.local' -Pattern '^VITE_FIREBASE_API_KEY=.+' -Quiet)) {
  Write-Host 'WARNING: VITE_FIREBASE_API_KEY is empty in .env.local.' -ForegroundColor Yellow
}

$needsSigning = $Target -ne 'debug'
$tasks = @(switch ($Target) {
  'debug'   { 'assembleDebug' }
  'release' { 'assembleRelease' }
  'aab'     { 'bundleRelease' }
  'all'     { 'assembleDebug'; 'assembleRelease'; 'bundleRelease' }
})

if ($needsSigning) {
  $vars = 'KEYSTORE_FILE', 'KEYSTORE_PASSWORD', 'KEY_ALIAS', 'KEY_PASSWORD'
  $missing = $vars | Where-Object { -not (Get-Item "Env:$_" -ErrorAction SilentlyContinue) }
  if ($missing) {
    if (Test-Path $SigningScript) { . $SigningScript }
    else { throw "Signing variables not set and $SigningScript not found." }
  }
  foreach ($v in $vars) {
    if (-not (Get-Item "Env:$v" -ErrorAction SilentlyContinue)) { throw "$v is not set." }
  }
  if (-not (Test-Path $env:KEYSTORE_FILE)) { throw "Keystore not found: $env:KEYSTORE_FILE" }
}

# versionCode: increases on every release/aab build (Play needs a higher number each upload)
$last = 0
if (Test-Path $CounterFile) { $last = [int]((Get-Content $CounterFile -Raw).Trim()) }
$code = if ($needsSigning) { $last + 1 } else { [Math]::Max($last, 1) }
$env:GITHUB_RUN_NUMBER = "$code"
Write-Host "Target: $Target   versionCode: $code"

# ---------- Clean ----------
Step 'Clean'
foreach ($p in 'dist', 'android\app\build', 'android\build', 'android\app\src\main\assets\public') {
  Remove-Item -Recurse -Force $p -ErrorAction SilentlyContinue
}

if ($FreshInstall -or -not (Test-Path 'node_modules')) {
  Step 'Install dependencies'
  if ($FreshInstall) { Remove-Item -Recurse -Force 'node_modules' -ErrorAction SilentlyContinue }
  try { Run 'npm' @('ci') }
  catch { Write-Host 'npm ci failed (lockfile out of sync?) - falling back to npm install' -ForegroundColor Yellow; Run 'npm' @('install') }
}

# ---------- Web build + Capacitor sync ----------
Step 'Build web app'
Run 'npm' @('run', 'build')
Step 'Capacitor sync'
Run 'npx' @('cap', 'sync', 'android')

# ---------- Gradle ----------
Step "Gradle: clean $($tasks -join ' ')"
Push-Location 'android'
try { Run '.\gradlew.bat' (@('clean') + $tasks) } finally { Pop-Location }

# ---------- Verify and collect ----------
$outputs = @()
if ($Target -in 'debug', 'all')   { $outputs += @{ Path = 'android\app\build\outputs\apk\debug\app-debug.apk';        Name = 'debug';   Ext = 'apk'; Signed = $false } }
if ($Target -in 'release', 'all') { $outputs += @{ Path = 'android\app\build\outputs\apk\release\app-release.apk';    Name = 'release'; Ext = 'apk'; Signed = $true } }
if ($Target -in 'aab', 'all')     { $outputs += @{ Path = 'android\app\build\outputs\bundle\release\app-release.aab'; Name = 'release'; Ext = 'aab'; Signed = $true } }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmm'
Step 'Verify and collect'
foreach ($o in $outputs) {
  if (-not (Test-Path $o.Path)) { throw "Expected output missing: $($o.Path)" }
  if ($o.Signed) {
    $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $text = (& "$JavaHome\bin\keytool.exe" -printcert -jarfile $o.Path 2>&1 | Out-String)
    $ErrorActionPreference = $prev
    if ($text -notmatch 'Owner:') { throw "$($o.Path) is NOT signed. Check the signing variables and the build output." }
  }
  $dest = Join-Path $OutDir ("exploreindia-{0}-v{1}-{2}.{3}" -f $o.Name, $code, $stamp, $o.Ext)
  Copy-Item $o.Path $dest -Force
  $mb = [Math]::Round((Get-Item $dest).Length / 1MB, 1)
  Write-Host ("OK  {0}  ({1} MB){2}" -f $dest, $mb, $(if ($o.Signed) { '  signed' } else { '' })) -ForegroundColor Green
}

if ($needsSigning) { Set-Content -Path $CounterFile -Value $code }

# ---------- Optional: install on a connected phone ----------
if ($Install -or $Reinstall) {
  Step 'Install on device'
  $apk = $outputs | Where-Object { $_.Ext -eq 'apk' } | Select-Object -First 1
  if (-not $apk) {
    Write-Host 'Nothing to install: an AAB cannot be installed directly. Use -Target debug or release.' -ForegroundColor Yellow
  } else {
    $adbExe = if (Test-Path $Adb) { $Adb } else { 'adb' }
    $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
    $devices = (& $adbExe devices 2>&1 | Out-String)
    if ($devices -notmatch '\tdevice') {
      Write-Host 'No authorised phone found. Plug it in, enable USB debugging, accept the prompt, then run adb devices.' -ForegroundColor Yellow
    } else {
      if ($Reinstall) {
        Write-Host 'Uninstalling the existing app first (this deletes its saved data on the phone)...'
        & $adbExe uninstall com.nishaantech.exploreindia | Out-Host
      }
      $res = (& $adbExe install -r $apk.Path 2>&1 | Out-String)
      Write-Host $res
      if ($res -match 'Success') {
        & $adbExe shell monkey -p com.nishaantech.exploreindia -c android.intent.category.LAUNCHER 1 | Out-Null
        Write-Host "Installed $($apk.Name) APK and launched it." -ForegroundColor Green
      } else {
        Write-Host 'Install failed. If it says INSTALL_FAILED_UPDATE_INCOMPATIBLE (debug vs release signature), run again with -Reinstall.' -ForegroundColor Yellow
      }
    }
    $ErrorActionPreference = $prev
  }
}

Write-Host "`nDone. Branch $branch @ $hash, versionCode $code." -ForegroundColor Green