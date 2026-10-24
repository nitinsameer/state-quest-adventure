#!/usr/bin/env node
/**
 * Comprehensive fix for UTF-8 mojibake encoding in all source files
 * Converts files from Latin-1 (corrupted) back to proper UTF-8
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, extname } from "path";

const ALLOWED_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".css"];
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "android",
  "ios",
  ".agents",
  ".kiro",
  "apk_extract",
  "temp_apk",
  ".tanstack",
  ".idea",
  ".vscode",
]);

function hasHighBytes(buffer) {
  // Check if buffer contains high bytes (0x80+) that indicate encoding issues
  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] >= 0x80) return true;
  }
  return false;
}

function fixEncoding(filePath) {
  try {
    const buffer = readFileSync(filePath);

    // Check if file has high bytes (mojibake indicator)
    if (!hasHighBytes(buffer)) {
      return false;
    }

    // Try reading as Latin-1 and converting to UTF-8
    const asLatin1 = buffer.toString("latin1");
    const asUTF8 = Buffer.from(asLatin1, "latin1").toString("utf8");

    // Only write if the result looks better (has valid emoji characters)
    if (asUTF8 !== asLatin1 && /[\u1F300-\u1F9FF]|[\u2300-\u27BF]|⭐|✨|✔/.test(asUTF8)) {
      writeFileSync(filePath, asUTF8, "utf8");
      return true;
    }
  } catch (e) {
    // Silently skip files that cause errors
  }

  return false;
}

function walk(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push(...walk(fullPath));
      } else if (entry.isFile()) {
        const ext = extname(fullPath);
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  } catch (err) {
    // Silently skip inaccessible directories
  }
  return results;
}

const rootDir = process.cwd();
const files = walk(rootDir);

let fixed = 0;
const fixedFiles = [];

for (const file of files) {
  if (fixEncoding(file)) {
    fixed++;
    const relPath = file.startsWith(rootDir) ? file.slice(rootDir.length + 1) : file;
    fixedFiles.push(relPath);
  }
}

console.log(`✓ Fixed ${fixed} files with encoding issues`);
if (fixedFiles.length > 0) {
  console.log("\nFixed files:");
  fixedFiles.forEach((f) => console.log(`  ${f}`));
}

process.exit(0);
