#!/usr/bin/env node

/**
 * Validation script for Android/Capacitor build integrity
 *
 * Verifies:
 * 1. Build output exists
 * 2. Key files are present
 * 3. No broken asset references
 * 4. Capacitor config is valid
 * 5. Android assets are synced
 *
 * Usage:
 *   npm run validate:android
 *   node scripts/validate-android-build.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function log(level, message) {
  const colors = {
    "✓": "\x1b[32m", // Green
    "✗": "\x1b[31m", // Red
    "⚠": "\x1b[33m", // Yellow
    "▸": "\x1b[36m", // Cyan
  };
  const reset = "\x1b[0m";
  const symbol = level === "pass" ? "✓" : level === "fail" ? "✗" : level === "warn" ? "⚠" : "▸";
  const color = colors[symbol];
  console.log(`${color}${symbol}${reset} ${message}`);
}

function pass(message) {
  passCount++;
  log("pass", message);
}

function fail(message) {
  failCount++;
  log("fail", message);
}

function warn(message) {
  warnCount++;
  log("warn", message);
}

function info(message) {
  log("info", message);
}

console.log("\n" + "=".repeat(60));
console.log("  ANDROID BUILD VALIDATION");
console.log("=".repeat(60) + "\n");

// 1. Check build output
info("Checking build output...");

const distClient = path.join(projectRoot, "dist", "client");
if (!fs.existsSync(distClient)) {
  fail("dist/client/ directory does not exist");
  console.log("\n  Run: npm run build");
  process.exit(1);
}
pass("dist/client/ exists");

// 2. Check index.html
info("\nChecking index.html...");

const indexPath = path.join(distClient, "index.html");
if (!fs.existsSync(indexPath)) {
  fail("dist/client/index.html does not exist");
  process.exit(1);
}
pass("dist/client/index.html exists");

const indexContent = fs.readFileSync(indexPath, "utf-8");

// Check for DOCTYPE
if (!indexContent.match(/<!DOCTYPE/i)) {
  fail("index.html missing DOCTYPE");
} else {
  pass("index.html has DOCTYPE");
}

// Check for body tag
if (!indexContent.match(/<body/i)) {
  fail("index.html missing <body> tag");
} else {
  pass("index.html has <body> tag");
}

// CRITICAL: Check for async attribute
if (indexContent.match(/async\s*:\s*!0|async\s*:\s*true|async\s+src/i)) {
  fail('CRITICAL: index.html contains "async" attribute in scripts');
  console.log("  This will cause React hydration to fail!");
  process.exit(1);
} else {
  pass('No "async" attributes in scripts (hydration safe)');
}

// 3. Check assets
info("\nChecking assets...");

const assetsPath = path.join(distClient, "assets");
if (!fs.existsSync(assetsPath)) {
  fail("dist/client/assets/ directory does not exist");
  process.exit(1);
}
pass("dist/client/assets/ exists");

// Check for main JS bundle
const jsFiles = fs
  .readdirSync(assetsPath)
  .filter((f) => f.startsWith("index-") && f.endsWith(".js"));
if (jsFiles.length === 0) {
  fail("No main bundle found (index-*.js)");
  process.exit(1);
} else if (jsFiles.length === 1) {
  pass(`Main bundle exists: ${jsFiles[0]}`);
} else {
  warn(`Multiple main bundles found: ${jsFiles.join(", ")}`);
}

// Check for CSS
const cssFiles = fs
  .readdirSync(assetsPath)
  .filter((f) => f.startsWith("styles-") && f.endsWith(".css"));
if (cssFiles.length === 0) {
  fail("No CSS bundle found (styles-*.css)");
  process.exit(1);
} else if (cssFiles.length === 1) {
  pass(`CSS bundle exists: ${cssFiles[0]}`);
} else {
  warn(`Multiple CSS bundles found: ${cssFiles.join(", ")}`);
}

// Check for images
const imageFiles = fs.readdirSync(assetsPath).filter((f) => /\.(png|jpg|jpeg|svg|gif)$/.test(f));
if (imageFiles.length === 0) {
  warn("No image files found in assets/");
} else {
  pass(`${imageFiles.length} image files found`);
}

// 4. Check asset references in index.html
info("\nChecking asset references...");

const cssRef = indexContent.match(/href="\.\/assets\/(styles-[\w.]+\.css)"/);
if (!cssRef) {
  fail("index.html does not reference CSS file");
} else {
  const cssFileName = cssRef[1];
  const cssPath = path.join(assetsPath, cssFileName);
  if (!fs.existsSync(cssPath)) {
    fail(`CSS file referenced but not found: assets/${cssFileName}`);
  } else {
    pass(`CSS reference valid: assets/${cssFileName}`);
  }
}

const jsRef = indexContent.match(/src="\.\/assets\/(index-[\w.]+\.js)"/);
if (!jsRef) {
  fail("index.html does not reference main JS file");
} else {
  const jsFileName = jsRef[1];
  const jsPath = path.join(assetsPath, jsFileName);
  if (!fs.existsSync(jsPath)) {
    fail(`JS file referenced but not found: assets/${jsFileName}`);
  } else {
    pass(`JS reference valid: assets/${jsFileName}`);
  }
}

// 5. Check Capacitor config
info("\nChecking Capacitor configuration...");

const capacitorConfigPath = path.join(projectRoot, "capacitor.config.ts");
if (!fs.existsSync(capacitorConfigPath)) {
  fail("capacitor.config.ts does not exist");
} else {
  const capacitorConfig = fs.readFileSync(capacitorConfigPath, "utf-8");
  if (capacitorConfig.includes("webDir: 'dist/client'")) {
    pass("Capacitor webDir configured correctly: dist/client");
  } else if (capacitorConfig.includes("webDir")) {
    warn("Capacitor webDir found but not verified to be dist/client");
  } else {
    fail("Capacitor webDir not configured");
  }
}

// 6. Check Android assets (if synced)
info("\nChecking Android assets...");

const androidAssetsPath = path.join(
  projectRoot,
  "android",
  "app",
  "src",
  "main",
  "assets",
  "public",
);
if (!fs.existsSync(androidAssetsPath)) {
  warn("Android assets not yet synced (run: npx cap sync android)");
} else {
  const androidIndexPath = path.join(androidAssetsPath, "index.html");
  if (!fs.existsSync(androidIndexPath)) {
    warn("Android index.html not found (run: npx cap sync android)");
  } else {
    pass("Android assets synced: index.html found");

    const androidAssetCount = fs.readdirSync(androidAssetsPath).length;
    const webAssetCount = fs.readdirSync(distClient, { recursive: true }).length;
    if (androidAssetCount > 0) {
      pass(`Android assets synced: ${androidAssetCount} files`);
    } else {
      fail("Android assets directory is empty");
    }
  }
}

// 7. Check build script
info("\nChecking build scripts...");

const packageJsonPath = path.join(projectRoot, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
if (packageJson.scripts && packageJson.scripts.build) {
  pass(`Build script configured: ${packageJson.scripts.build}`);
} else {
  fail("Build script not found in package.json");
}

// Final report
console.log("\n" + "=".repeat(60));
console.log(`  RESULTS: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);
console.log("=".repeat(60) + "\n");

if (failCount > 0) {
  console.log("❌ Validation FAILED\n");
  console.log("Fix errors above and run again:");
  console.log("  npm run validate:android\n");
  process.exit(1);
} else if (warnCount > 0) {
  console.log("⚠️  Validation PASSED (with warnings)\n");
  console.log("Warnings to address:");
  console.log("  - Run: npx cap sync android");
  console.log("  - Run: npm run build\n");
  process.exit(0);
} else {
  console.log("✅ Validation PASSED\n");
  console.log("Next steps:");
  console.log("  1. npx cap sync android   (if not already synced)");
  console.log("  2. cd android && ./gradlew clean assembleDebug");
  console.log("  3. adb install app/build/outputs/apk/debug/app-debug.apk\n");
  process.exit(0);
}
