#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Fix patterns that have incorrect emoji token references
// These need to be proper JSX expressions or template literals
const fixes = [
  {
    file: "src/routes/__root.tsx",
    find: "`{EMOJI.action.celebrate} Level ${currentLevel} - ${levelName}!`",
    replace: "`🎉 Level ${currentLevel} - ${levelName}!`",
  },
  {
    file: "src/routes/__root.tsx",
    find: '`You\'re now a "${levelName}"!\\nKeep exploring to reach the next milestone! {EMOJI.action.rocket}`',
    replace: '`You\'re now a "${levelName}"!\\nKeep exploring to reach the next milestone! 🚀`',
  },
  {
    file: "src/routes/__root.tsx",
    find: 'icon: "{EMOJI.action.star}"',
    replace: 'icon: "⭐"',
  },
  {
    file: "src/routes/__root.tsx",
    find: "If this keeps happening, talk to an adult about what's going on! wave emoji",
    replace: "If this keeps happening, talk to an adult about what's going on! 👋",
  },

  // Fix UnlockCelebration that may have bad formatting
  {
    file: "src/components/UnlockCelebration.tsx",
    find: "label: `Awesome! ${EMOJI.action.celebrate}`",
    replace: 'label: "Awesome! 🎉"',
  },
];

function fixFile(filePath, find, replace) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const before = content;
    content = content.replace(find, replace);

    if (content !== before) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`✓ Fixed: ${path.relative(root, filePath)}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error in ${path.relative(root, filePath)}: ${error.message}`);
  }
  return false;
}

console.log("🔧 Fixing JSX emoji references...\n");

let fixed = 0;
for (const { file, find, replace } of fixes) {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath, find, replace)) {
      fixed++;
    }
  } else {
    console.log(`⊘ File not found: ${file}`);
  }
}

console.log(`\n✅ Fixed ${fixed} issues!`);
