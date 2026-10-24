#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const remainingFixes = {
  "src/components/HomeScreen.tsx": [
    { pattern: /🏆(?!.*?")/g, replace: "{EMOJI.milestone.hundred}" },
  ],

  "src/components/ceremony/QuizCeremony.tsx": [
    { pattern: /🎉 New level!/g, replace: "{EMOJI.action.celebrate} New level!" },
    {
      pattern: /const STICKER_OPTIONS = \['😋', '.*?', '🎉'\]/g,
      replace: "const STICKER_OPTIONS = ['😋', '🎊', '{EMOJI.action.celebrate}']",
    },
  ],

  "src/components/PassportMightyTree.tsx": [
    { pattern: /🎯 Milestones/g, replace: "{EMOJI.milestone.twentyFive} Milestones" },
  ],

  "src/components/PassportSeedling.tsx": [
    { pattern: /✨ Region Complete!/g, replace: "{EMOJI.action.sparkle} Region Complete!" },
  ],

  "src/components/PassportSapling.tsx": [
    { pattern: /My Passport 📖/g, replace: "My Passport {EMOJI.icons.facts}" },
  ],

  "src/components/PostcardFrame.tsx": [
    {
      pattern: /const starDisplay = "⭐"\.repeat\(starCount\)/g,
      replace: "const starDisplay = EMOJI.action.star.repeat(starCount)",
    },
  ],

  "src/components/QuizAnswerFeedback.tsx": [
    {
      pattern:
        /\{?\['{?EMOJI\.action\.celebrate}?', '{?EMOJI\.action\.star}?', '🌟', '💫', '{?EMOJI\.action\.sparkle}?', '🎊', '🏆', '👏'\]?\}?/g,
      replace:
        "[{EMOJI.action.celebrate}, {EMOJI.action.star}, '🌟', '💫', {EMOJI.action.sparkle}, '🎊', {EMOJI.milestone.hundred}, '👏']",
    },
  ],

  "src/components/PostcardPreviewModal.tsx": [
    {
      pattern: /✨ Saved to your Passport!/g,
      replace: "{EMOJI.action.sparkle} Saved to your Passport!",
    },
  ],

  "src/components/screens.tsx": [
    {
      pattern: /{saved \? "🎉 Saved âœ"" : "Continue â†' Let's Explore!"}}/g,
      replace: '{saved ? `${EMOJI.action.celebrate} Saved ✓` : "Continue → Let\'s Explore!"}',
    },
  ],

  "src/components/state-performance-badges-view.tsx": [
    {
      pattern: /🎉 {\s*totalBadgesEarned\s*}/g,
      replace: "{EMOJI.action.celebrate} {totalBadgesEarned}",
    },
    { pattern: /Keep exploring! ⭐/g, replace: "Keep exploring! {EMOJI.action.star}" },
  ],

  "src/components/state-performance-badge-modal.tsx": [
    { pattern: /Keep Exploring! ⭐/g, replace: "Keep Exploring! {EMOJI.action.star}" },
    { pattern: /Keep going! ⭐/g, replace: "Keep going! {EMOJI.action.star}" },
  ],

  "src/components/StateCompletionCelebration.tsx": [
    {
      pattern: /✨ Completely Explored! ✨/g,
      replace: "{EMOJI.action.sparkle} Completely Explored! {EMOJI.action.sparkle}",
    },
    {
      pattern: /🏆 Amazing Achievement! 🏆/g,
      replace: "{EMOJI.milestone.hundred} Amazing Achievement! {EMOJI.milestone.hundred}",
    },
  ],

  "src/components/UnlockCelebration.tsx": [
    {
      pattern: /`🎉 \${total} new unlocks!`/g,
      replace: "`${EMOJI.action.celebrate} ${total} new unlocks!`",
    },
    {
      pattern: /`🏅 \${newBadges\.length} new badge\${newBadges\.length > 1 \? "s" : ""}!`/g,
      replace:
        '`${EMOJI.achievement.badge} ${newBadges.length} new badge${newBadges.length > 1 ? "s" : ""}!`',
    },
    { pattern: /label: "Awesome! 🎉"/g, replace: "label: `Awesome! ${EMOJI.action.celebrate}`" },
  ],
};

function processFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    for (const { pattern, replace } of replacements) {
      const before = content;
      content = content.replace(pattern, replace);
      if (content !== before) {
        console.log(`  ✓ Fixed in ${path.relative(root, filePath)}`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      return true;
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
  return false;
}

console.log("🔧 Fixing remaining emoji...\n");

let totalFixed = 0;
for (const [file, replacements] of Object.entries(remainingFixes)) {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    if (processFile(filePath, replacements)) {
      totalFixed++;
    }
  } else {
    console.log(`⊘ Skipped (not found): ${file}`);
  }
}

console.log(`\n✅ Fixed ${totalFixed} files!\n`);
