#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/**
 * Comprehensive fix for all hardcoded emoji and colors
 * Fixes encoding issues, replaces emoji with tokens, replaces colors with CSS vars
 */

const fixes = {
  'src/components/screens.tsx': [
    // Emoji replacements: { pattern, replacement }
    { pattern: /🎂/g, replace: '{EMOJI.action.birthday}' },
    { pattern: /🎉(?!.*?")/g, replace: '{EMOJI.action.celebrate}' },
    { pattern: /✨/g, replace: '{EMOJI.action.sparkle}' },
    { pattern: /🌍/g, replace: '{EMOJI.utility.worldMap}' },
    { pattern: /🚨/g, replace: '{EMOJI.utility.warning}' },
    { pattern: /🎖️/g, replace: '{EMOJI.achievement.explorer}' },
    { pattern: /🎯/g, replace: '{EMOJI.milestone.twentyFive}' },
    { pattern: /🏆/g, replace: '{EMOJI.milestone.hundred}' },
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
    { pattern: /🏃‍♂️/g, replace: '{EMOJI.action.runningMan}' },
    { pattern: /💨/g, replace: '{EMOJI.action.momentum}' },
    { pattern: /👉/g, replace: '{EMOJI.action.pointingFinger}' },
    { pattern: /🌳/g, replace: '{EMOJI.utility.tree}' },
    { pattern: /🛖/g, replace: '{EMOJI.achievement.monument}' },
    { pattern: /🦁/g, replace: '{EMOJI.achievement.animal}' },
    { pattern: /🎨/g, replace: '{EMOJI.theme.painter}' },
    { pattern: /🚀/g, replace: '{EMOJI.action.rocket}' },
    { pattern: /📖/g, replace: '{EMOJI.icons.facts}' },
  ],
  
  'src/components/ThemesScreen.tsx': [
    // Color replacements
    { pattern: /"#FF7A1A"/g, replace: 'var(--color-brand-saffron)' },
    { pattern: /"#FFFFFF"/g, replace: 'var(--color-bg-primary)' },
    { pattern: /"#1A1A1A"/g, replace: 'var(--color-text-primary)' },
    { pattern: /"#FF9944"/g, replace: 'var(--color-brand-saffron-dark)' },
    { pattern: /"#F5F5F5"/g, replace: 'var(--color-text-inverted)' },
    { pattern: /"#000000"/g, replace: 'var(--color-brand-ink)' },
    { pattern: /"#F0F0F0"/g, replace: 'var(--color-bg-surface-secondary)' },
    { pattern: /"#3B82F6"/g, replace: 'var(--color-brand-explorer)' },
    { pattern: /"#1F2937"/g, replace: 'var(--color-text-primary)' },
    { pattern: /"#FF6FB1"/g, replace: 'var(--color-brand-gem)' },
    { pattern: /"#FFF6E5"/g, replace: 'var(--color-brand-saffron-light)' },
    { pattern: /"#131A33"/g, replace: 'var(--color-brand-ink)' },
  ],

  'src/components/PostcardCard.tsx': [
    { pattern: /oklch\(0.35 0.1 150\)/g, replace: 'var(--success-on-bg)' },
    { pattern: /oklch\(0.35 0.1 260\)/g, replace: 'var(--text-muted)' },
  ],

  'src/components/DailyGoalCard.tsx': [
    { pattern: /🎉/g, replace: '{EMOJI.feedback.success}' },
    { pattern: /🚀/g, replace: '{EMOJI.feedback.rocket}' },
    { pattern: /💪/g, replace: '{EMOJI.feedback.encouragement}' },
    { pattern: /🏆/g, replace: '{EMOJI.feedback.trophy}' },
    { pattern: /🎯/g, replace: '{EMOJI.feedback.goal}' },
  ],

  'src/components/QuizCeremony.tsx': [
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
    { pattern: /🎉/g, replace: '{EMOJI.action.celebrate}' },
    { pattern: /☆/g, replace: '{EMOJI.action.emptyStar}' },
  ],

  'src/components/PostcardScreen.tsx': [
    { pattern: /✨/g, replace: '{EMOJI.action.sparkle}' },
  ],

  'src/components/ExpandableCard.tsx': [
    { pattern: /✨/g, replace: '{EMOJI.action.sparkle}' },
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
    { pattern: /📖/g, replace: '{EMOJI.icons.facts}' },
  ],

  'src/components/PassportSeedling.tsx': [
    { pattern: /✨/g, replace: '{EMOJI.action.sparkle}' },
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
  ],

  'src/components/PassportSprout.tsx': [
    { pattern: /🌍/g, replace: '{EMOJI.utility.worldMap}' },
    { pattern: /🏠/g, replace: '{EMOJI.nav.home}' },
  ],

  'src/components/PassportSapling.tsx': [
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
    { pattern: /🏠/g, replace: '{EMOJI.nav.home}' },
  ],

  'src/components/FirstSessionTutorial.tsx': [
    { pattern: /🗺️/g, replace: '{EMOJI.nav.map}' },
  ],

  'src/routes/__root.tsx': [
    { pattern: /🏠/g, replace: '{EMOJI.nav.home}' },
    { pattern: /👋/g, replace: 'wave emoji' },
    { pattern: /🗺️/g, replace: '{EMOJI.nav.map}' },
    { pattern: /🎉/g, replace: '{EMOJI.action.celebrate}' },
    { pattern: /🚀/g, replace: '{EMOJI.action.rocket}' },
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
  ],

  'src/components/PostcardModal.tsx': [
    { pattern: /🛖/g, replace: '{EMOJI.achievement.monument}' },
    { pattern: /🦁/g, replace: '{EMOJI.achievement.animal}' },
    { pattern: /🏠/g, replace: '{EMOJI.nav.home}' },
  ],

  'src/components/ParentZone.tsx': [
    { pattern: /oklch\(0.9_0.02_260\)/g, replace: 'var(--progress-track)' },
  ],

  'src/components/PassportSeedling.tsx': [
    { pattern: /oklch\(0.9_0.02_260\)/g, replace: 'var(--progress-track)' },
  ],

  'src/components/PhoneFrame.tsx': [
    { pattern: /rgba\(15,23,42,0.35\)/g, replace: 'var(--shadow-raised)' },
    { pattern: /rgba\(15,23,42,0.25\)/g, replace: 'var(--shadow-raised)' },
    { pattern: /#111/g, replace: 'var(--border-strong)' },
  ],

  'src/components/PostcardPreviewModal.tsx': [
    { pattern: /rgba\(15,23,42,0.22\)/g, replace: 'var(--shadow-raised)' },
  ],

  'src/components/AudioTestScreen.tsx': [
    { pattern: /🚀/g, replace: '{EMOJI.action.rocket}' },
  ],

  'src/components/DebugScreen.tsx': [
    { pattern: /🎯/g, replace: '{EMOJI.milestone.twentyFive}' },
  ],

  'src/components/QuizAnswerFeedback.tsx': [
    { pattern: /🎉/g, replace: '{EMOJI.action.celebrate}' },
    { pattern: /✨/g, replace: '{EMOJI.action.sparkle}' },
    { pattern: /⭐/g, replace: '{EMOJI.action.star}' },
  ],
};

function processFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const { pattern, replace } of replacements) {
      const before = content;
      content = content.replace(pattern, replace);
      if (content !== before) {
        console.log(`  ✓ Fixed pattern in ${path.relative(root, filePath)}`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
  }
  return false;
}

console.log('🔧 Starting comprehensive emoji and color fixes...\n');

let totalFixed = 0;
for (const [file, replacements] of Object.entries(fixes)) {
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
