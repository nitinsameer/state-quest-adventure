#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Final cleanup: fix remaining mojibake and legitimate emoji
const finalFixes = [
  {
    file: "src/components/screens.tsx",
    replacements: [
      { pattern: /🏆† STATE MASTERED! 🏆†/g, replace: "🏆 STATE MASTERED! 🏆" },
      { pattern: /🏆"¥/g, replace: "🔥" },
      { pattern: /🏆'‹/g, replace: "👋" },
      { pattern: /🏆›️/g, replace: "🛖" },
      { pattern: /🏆—£️/g, replace: "🗣️" },
      { pattern: /🏆'¥/g, replace: "👥" },
      { pattern: /🏆'¡/g, replace: "💡" },
      { pattern: /🏆""/g, replace: "🔔" },
      { pattern: /🏆"' Quiz Locked/g, replace: "🔒 Quiz Locked" },
      { pattern: /🏆"'/g, replace: "🔒" },
      { pattern: /🏆"' Locked/g, replace: "🔒 Locked" },
      { pattern: /🏆'€ Sneak Peek/g, replace: "👀 Sneak Peek" },
      { pattern: /"🏆›"/g, replace: '"🛖"' },
      { pattern: /Take the Quiz! 🎯/g, replace: "Take the Quiz! {EMOJI.milestone.twentyFive}" },
      { pattern: /🏆ƒâ€♂️/g, replace: "🏃‍♂️" },
      { pattern: /🏆'¨/g, replace: "💨" },
      { pattern: /🏆›/g, replace: "🛖" },
      { pattern: /🏆—£/g, replace: "🗣️" },
      { pattern: /🏆/g, replace: "🏆" }, // Final pass to catch remaining mojibake
    ],
  },

  {
    file: "src/components/PostcardScreen.tsx",
    replacements: [
      { pattern: /monument: "🛖️"/g, replace: 'monument: "{EMOJI.achievement.monument}"' },
      { pattern: /explorer: "🎖️"/g, replace: 'explorer: "{EMOJI.achievement.explorer}"' },
      { pattern: /�x🏠 Home/g, replace: "{EMOJI.nav.home} Home" },
    ],
  },

  {
    file: "src/components/PostcardPreviewModal.tsx",
    replacements: [
      { pattern: /explorer: "🎖️"/g, replace: 'explorer: "{EMOJI.achievement.explorer}"' },
    ],
  },

  {
    file: "src/components/LockedPostcardModal.tsx",
    replacements: [{ pattern: /🗺️ Explore State/g, replace: "{EMOJI.nav.map} Explore State" }],
  },

  {
    file: "src/components/HomeScreen.tsx",
    replacements: [
      {
        pattern: /<div className="text-2xl mb-1">🗺️<\/div>/g,
        replace: '<div className="text-2xl mb-1">{EMOJI.nav.map}</div>',
      },
    ],
  },

  {
    file: "src/components/StateCompletionCelebration.tsx",
    replacements: [{ pattern: /stateEmoji = '🗺️'/g, replace: "stateEmoji = '{EMOJI.nav.map}'" }],
  },

  {
    file: "src/components/UnlockCelebration.tsx",
    replacements: [
      { pattern: /🏅/g, replace: "{EMOJI.achievement.badge}" },
      { pattern: /label: "Awesome! 🎉"/g, replace: "label: `Awesome! ${EMOJI.action.celebrate}`" },
    ],
  },

  {
    file: "src/components/ceremony/QuizCeremony.tsx",
    replacements: [{ pattern: /☆/g, replace: "{EMOJI.action.emptyStar}" }],
  },
];

let fixed = 0;

for (const { file, replacements } of finalFixes) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;

  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const before = content;

    for (const { pattern, replace } of replacements) {
      content = content.replace(pattern, replace);
    }

    if (content !== before) {
      fs.writeFileSync(filePath, content, "utf-8");
      fixed++;
      console.log(`✓ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error in ${file}: ${error.message}`);
  }
}

console.log(`\n✅ Final cleanup: fixed ${fixed} files!`);
