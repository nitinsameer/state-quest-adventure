#!/usr/bin/env node
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
]);

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
    // Skip
  }
  return results;
}

// Files with known control character issues
const problematicFiles = [
  "src/components/QuizCeremony.tsx",
  "src/components/JourneyDestinationCard.tsx",
  "src/components/LanguageToggle.tsx",
  "src/components/ParentGate.tsx",
  "src/components/PostcardModal.tsx",
  "src/components/PostcardPreviewModal.tsx",
  "src/components/PostcardScreen.tsx",
  "src/components/state-performance-badges-view.tsx",
  "src/lib/__tests__/progress-ceremony.test.ts",
];

let fixed = 0;

for (const file of problematicFiles) {
  try {
    const content = readFileSync(file, "utf8");

    // Remove control characters except tabs, newlines, carriage returns
    // Pattern: U+0000-U+001F except \t (09), \n (0A), \r (0D)
    const cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

    if (cleaned !== content) {
      writeFileSync(file, cleaned, "utf8");
      fixed++;
      console.log(`✓ Cleaned ${file.replace(process.cwd(), ".")}`);
    }
  } catch (e) {
    console.error(`✗ Error with ${file}: ${e.message}`);
  }
}

console.log(`\nFixed ${fixed} files`);
