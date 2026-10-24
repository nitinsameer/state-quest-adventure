#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

const files = [
  "src/components/PostcardModal.tsx",
  "src/components/PostcardScreen.tsx",
  "src/components/QuizCeremony.tsx",
];

for (const file of files) {
  try {
    let content = readFileSync(file, "utf8");

    // Fix known emoji patterns by looking for the replacement character (U+FFFD = EF BF BD)
    // The pattern "∩┐╜" in PowerShell output is the replacement char displayed
    // Replace all occurrences of the replacement char followed by hex patterns

    // Fix specific button texts in PostcardModal.tsx
    if (file.includes("PostcardModal")) {
      // Replace "Home" button - should have emoji before it
      content = content.replace(/[^\x00-\x7F]+\s+Home/, "🏠 Home");
      // Replace "Next State" button
      content = content.replace(/[^\x00-\x7F]+\s+Next State/, "🎯 Next State");
    }

    // Fix QuizCeremony star display
    if (file.includes("QuizCeremony")) {
      // Replace empty star (should be ☆)
      content = content.replace(/[^\x00-\x7F]+'\}/g, "'☆'}");
    }

    // Write back if changed
    writeFileSync(file, content, "utf8");
    console.log(`✓ Fixed ${file}`);
  } catch (e) {
    console.error(`✗ Error fixing ${file}: ${e.message}`);
  }
}
