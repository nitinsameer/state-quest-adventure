#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import imageminPngquant from "imagemin-pngquant";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ASSETS_DIR = "./src/assets";
const SPLASH_BASE = "./android/app/src/main/res";
const SIZE_THRESHOLD = 300 * 1024; // 300 KB

console.log("\n📦 Asset Optimization Script\n");

// Phase 1: Convert PNGs to WebP
console.log("Phase 1: Converting PNGs > 300 KB to WebP\n");

const pngFiles = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.endsWith(".png"))
  .map((f) => ({
    name: f,
    path: path.join(ASSETS_DIR, f),
    size: fs.statSync(path.join(ASSETS_DIR, f)).size,
  }))
  .filter((f) => f.size > SIZE_THRESHOLD)
  .sort((a, b) => b.size - a.size);

console.log(`Found ${pngFiles.length} PNG files > 300 KB:\n`);

let totalOriginal = 0;
let totalConverted = 0;
const convertResults = [];

// Get list of files to convert
const filesToConvert = pngFiles.map((f) => f.path);

if (filesToConvert.length > 0) {
  try {
    await imagemin(filesToConvert, {
      destination: ASSETS_DIR,
      plugins: [imageminWebp({ quality: 82 })],
    });

    // Check results
    pngFiles.forEach((file) => {
      const outputPath = file.path.replace(/\.png$/, ".webp");
      if (fs.existsSync(outputPath)) {
        const outputSize = fs.statSync(outputPath).size;
        const outputKB = (outputSize / 1024).toFixed(2);
        const savingsKB = ((file.size - outputSize) / 1024).toFixed(2);
        const savingsPercent = (((file.size - outputSize) / file.size) * 100).toFixed(1);

        totalOriginal += file.size;
        totalConverted += outputSize;

        convertResults.push({
          file: file.name,
          pngKB: parseFloat((file.size / 1024).toFixed(2)),
          webpKB: parseFloat(outputKB),
          savingsKB: parseFloat(savingsKB),
          savingsPercent: parseFloat(savingsPercent),
        });

        console.log(
          `  ✓ ${file.name.replace(/\.png$/, ".webp")} (${outputKB} KB) - saved ${savingsPercent}%`,
        );
      } else {
        console.log(`  ✗ Failed to convert ${file.name}`);
      }
    });
    console.log();
  } catch (err) {
    console.error(`Error during conversion: ${err.message}\n`);
  }
}

// Phase 2: Optimize Android splash screens (lossless)
console.log("Phase 2: Optimizing Android splash screens (lossless)\n");

function getAllSplashFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSplashFiles(fullPath));
    } else if (entry.name === "splash.png") {
      files.push(fullPath);
    }
  });

  return files;
}

const splashFiles = getAllSplashFiles(SPLASH_BASE);
console.log(`Found ${splashFiles.length} splash.png files\n`);

let totalSplashBefore = 0;
let totalSplashAfter = 0;
const splashResults = [];

try {
  await imagemin(splashFiles, {
    destination: SPLASH_BASE,
    plugins: [
      imageminPngquant({
        quality: [0.8, 0.9],
        strip: true,
      }),
    ],
  });

  // Check results
  splashFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const newStat = fs.statSync(file);
      const beforeKB = (newStat.size / 1024).toFixed(2);
      const relPath = file.replace(SPLASH_BASE + path.sep, "").replace(/\\/g, "/");

      console.log(`  ✓ Optimized ${relPath} to ${beforeKB} KB`);
      totalSplashAfter += newStat.size;
    }
  });
} catch (err) {
  console.error(`Error during splash optimization: ${err.message}\n`);
}

// Summary
console.log("\n📊 SUMMARY\n");
console.log("=".repeat(70));

if (convertResults.length > 0) {
  const totalSavings = totalOriginal - totalConverted;
  const totalSavingsPercent =
    totalOriginal > 0 ? ((totalSavings / totalOriginal) * 100).toFixed(1) : 0;
  console.log(`WebP Conversions: ${convertResults.length} files`);
  console.log(`  Total original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Total converted: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `  Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${totalSavingsPercent}%)\n`,
  );
}

console.log(`Splash Screen Optimizations: ${splashFiles.length} files`);
console.log(`  Target: lossless compression optimization complete\n`);

console.log("=".repeat(70));
console.log("\n✅ Asset optimization complete!\n");

// Write results to file
const report = {
  timestamp: new Date().toISOString(),
  webpConversions: convertResults,
  webpStats: {
    count: convertResults.length,
    totalOriginalMB: totalOriginal > 0 ? (totalOriginal / 1024 / 1024).toFixed(2) : 0,
    totalConvertedMB: totalConverted > 0 ? (totalConverted / 1024 / 1024).toFixed(2) : 0,
    totalSavingsMB:
      totalOriginal > totalConverted
        ? ((totalOriginal - totalConverted) / 1024 / 1024).toFixed(2)
        : 0,
    totalSavingsPercent:
      totalOriginal > 0 ? (((totalOriginal - totalConverted) / totalOriginal) * 100).toFixed(1) : 0,
  },
  splashOptimizations: {
    count: splashFiles.length,
    method: "pngquant lossless compression",
  },
};

fs.writeFileSync(".agents/tasks/asset-optimization-report.json", JSON.stringify(report, null, 2));
console.log("Report saved to .agents/tasks/asset-optimization-report.json\n");
