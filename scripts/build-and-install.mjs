#!/usr/bin/env node

/**
 * Build and Install Workflow
 * 
 * REQUIRED: This script automates the complete build-and-install process:
 * 1. Clean dist and build artifacts
 * 2. Run full production build
 * 3. Generate APK and verify
 * 4. Install to Android device/emulator (AUTOMATIC)
 * 
 * Usage:
 *   npm run build:clean              # Automatic install (recommended)
 *   npm run build:clean -- --verbose # With detailed output
 *   npm run build:clean -- --no-install  # Build only (skip install)
 * 
 * Requirements:
 *   - Android SDK configured
 *   - device/emulator connected (USB or Emulator running)
 *   - USB debugging enabled (for devices)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const args = process.argv.slice(2);
// INSTALL IS NOW ALWAYS ON - Required for on-device testing
const shouldInstall = !args.includes('--no-install');
const verbose = args.includes('--verbose');

function log(message, level = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '✓',
    warn: '⚠️',
    error: '❌',
    step: '→',
  }[level];
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function executeCommand(command, description) {
  log(description, 'step');
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: verbose ? 'inherit' : 'pipe',
      encoding: 'utf-8',
    });
    log(`${description} - DONE`, 'info');
    return output;
  } catch (error) {
    log(`${description} - FAILED`, 'error');
    if (!verbose) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    log(`${description}: ${sizeKB} KB`, 'info');
    return true;
  } else {
    log(`${description} NOT FOUND: ${filePath}`, 'error');
    return false;
  }
}

async function main() {
  log('Build & Install Workflow Started', 'step');
  log(`Mode: ${shouldInstall ? 'Build + Auto-Install' : 'Build Only'}`, 'info');
  
  // Step 1: Clean dist directory
  log('Cleaning dist directory...', 'step');
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    log('Dist directory cleaned', 'info');
  }

  // Step 2: Run production build
  executeCommand(
    'npm run build',
    'Running production build...'
  );

  // Step 2.5: Build Android APK using Gradle
  executeCommand(
    'cd android && .\\gradlew.bat assembleRelease',
    'Building Android APK with Gradle...'
  );

  // Step 3: Verify APK was generated
  // Capacitor builds APK in android/app/build/outputs/apk/
  const apkPaths = [
    'android/app/build/outputs/apk/debug/app-debug.apk',
    'android/app/build/outputs/apk/release/app-release.apk',
    'android/app/build/outputs/apk/release/app-release-unsigned.apk',
  ];
  
  let apkPath = null;
  for (const checkPath of apkPaths) {
    const fullPath = path.join(projectRoot, checkPath);
    if (fs.existsSync(fullPath)) {
      apkPath = checkPath;
      break;
    }
  }
  
  const apkExists = apkPath ? checkFile(apkPath, 'APK generated') : false;
  
  if (!apkExists) {
    log('APK not found in expected locations:', 'warn');
    apkPaths.forEach(p => log(`  - ${p}`, 'warn'));
  }

  if (!apkExists) {
    log('APK not found - build may have failed', 'warn');
  }

  // Step 4: Install to device (AUTOMATIC unless --no-install flag)
  if (shouldInstall) {
    if (apkExists && apkPath) {
      try {
        executeCommand(
          `adb install -r "${path.join(projectRoot, apkPath)}"`,
          'Installing APK to device...'
        );
        log('App installed successfully to device/emulator', 'info');
      } catch (error) {
        log(`Installation failed: ${error.message}`, 'warn');
        log('Possible causes:', 'warn');
        log('  - Device not connected: Run "adb devices" to check', 'warn');
        log('  - USB debugging disabled: Enable in Developer Options', 'warn');
        log('  - Emulator not running: Start Android Emulator', 'warn');
        log('Manual installation:', 'warn');
        log(`  adb install -r "${path.join(projectRoot, apkPath)}"`, 'warn');
      }
    } else {
      log('Cannot install - APK not generated. Likely build failed.', 'error');
      process.exit(1);
    }
  } else {
    log('Skipped installation (use --no-install to skip)', 'info');
    if (apkPath) {
      log(`Manual install: adb install -r "${path.join(projectRoot, apkPath)}"`, 'info');
    }
  }

  log('Build & Install Workflow Complete! ✨', 'step');
  
  if (!shouldInstall) {
    log('Installation skipped (--no-install flag used)', 'info');
  } else if (apkExists) {
    log('App is ready on device/emulator!', 'info');
  }
}

main().catch((error) => {
  log(`Workflow failed: ${error.message}`, 'error');
  process.exit(1);
});
