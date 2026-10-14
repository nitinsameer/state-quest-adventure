#!/usr/bin/env node
/**
 * Fix UTF-8 mojibake sequences in source files.
 * 
 * The problem: when files were written with the wrong encoding (e.g., as Latin-1
 * instead of UTF-8), emoji and symbols got corrupted into mojibake sequences.
 * 
 * This script detects these patterns and fixes them by mapping each mojibake sequence
 * back to its intended Unicode character.
 * 
 * Usage: node scripts/fix-mojibake.mjs [--dry|--write]
 * Default: dry run (report count only)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Files to check
const filesToCheck = [
  'src/components/screens.tsx',
  'src/components/ceremony/QuizCeremony.tsx',
  'src/components/PostcardModal.tsx',
  'src/components/PostcardScreen.tsx',
  'src/components/JourneyDestinationCard.tsx',
  'src/components/PostcardPreviewModal.tsx',
  'src/components/state-performance-badge-modal.tsx',
  'src/components/state-performance-badges-view.tsx',
  'src/components/PassportSeedling.tsx',
  'src/components/LanguageToggle.tsx',
];

const args = process.argv.slice(2);
const isDry = !args.includes('--write');
const shouldWrite = args.includes('--write');

/**
 * Comprehensive mojibake fix mapping.
 * Each corrupted sequence maps to its correct Unicode character.
 */
const fixPatterns = [
  // These are mojibake sequences where UTF-8 4-byte emoji codes got mangled
  // When a 4-byte emoji (F0 9F XX XX) is read as Latin-1 strings, it becomes 4 separate chars
  
  // Home emoji pattern variations
  { pattern: /ðŸ /g, replacement: '🏠 ' },
  
  // Map emoji and variants
  { pattern: /ðŸ—º/g, replacement: '🗺' },
  { pattern: /ðŸ—ºï¸/g, replacement: '🗺️' },
  
  // Search/magnifying glass
  { pattern: /ðŸ"/g, replacement: '🔍' },
  
  // Trophies and awards
  { pattern: /ðŸ…/g, replacement: '🏆' },
  { pattern: /ðŸ†/g, replacement: '🏆' },
  
  // Passport/book emoji
  { pattern: /ðŸŽ«/g, replacement: '🎫' },
  { pattern: /ðŸ›ï¸/g, replacement: '🏛️' },
  { pattern: /ðŸ›/g, replacement: '🏛' },
  
  // Animals
  { pattern: /ðŸ¾/g, replacement: '🐾' },
  
  // Explorer/eye emoji
  { pattern: /ðŸŽ–ï¸/g, replacement: '🎖️' },
  { pattern: /ðŸŽ–/g, replacement: '🎖' },
  
  // User/profile
  { pattern: /ðŸ'¤/g, replacement: '👤' },
  
  // Seedling and plants
  { pattern: /ðŸŒ±/g, replacement: '🌱' },
  { pattern: /ðŸŒ¿/g, replacement: '🌿' },
  { pattern: /ðŸŒ³/g, replacement: '🌳' },
  { pattern: /ðŸŒ²/g, replacement: '🌲' },
  
  // Party and celebration
  { pattern: /ðŸŽ‰/g, replacement: '🎉' },
  { pattern: /ðŸ¥³/g, replacement: '🥳' },
  { pattern: /ðŸ'''/g, replacement: '🎊' },
  { pattern: /ðŸ'/g, replacement: '🎊' },
  
  // Stars and sparkles
  { pattern: /ðŸŒŸ/g, replacement: '⭐' },
  { pattern: /ðŸ˜‹/g, replacement: '😋' },
  { pattern: /ðŸž/g, replacement: '🏞' },
  { pattern: /ðŸžï¸/g, replacement: '🏞️' },
  
  // Running and movement
  { pattern: /ðŸƒ"/g, replacement: '🏃‍' },
  { pattern: /ðŸƒ/g, replacement: '🏃' },
  
  // Hand gestures
  { pattern: /ðŸ'‹/g, replacement: '👋' },
  { pattern: /ðŸ'‹ï¸/g, replacement: '👋️' },
  
  // Fire and momentum
  { pattern: /ðŸ"¥/g, replacement: '🔥' },
  
  // Storage and saving
  { pattern: /ðŸ'¾/g, replacement: '💾' },
  
  // Share and communication
  { pattern: /ðŸ"—/g, replacement: '📗' },
  { pattern: /ðŸ"–/g, replacement: '📖' },
  
  // Celebration and achievement markers
  { pattern: /ðŸ"¤/g, replacement: '🔤' },
  { pattern: /ðŸ"'/g, replacement: '🔒' },
  { pattern: /ðŸ"'/g, replacement: '🔒' },
  { pattern: /ðŸ"¥/g, replacement: '🔥' },
  
  // Lightbulb and ideas
  { pattern: /ðŸ'¡/g, replacement: '💡' },
  
  // Goals and targets
  { pattern: /ðŸ¯/g, replacement: '🎯' },
  
  // Warnings
  { pattern: /ðŸš¨/g, replacement: '🚨' },
  
  // Globe and world
  { pattern: /ðŸŒ/g, replacement: '🌍' },
  
  // Age band emojis
  { pattern: /ðŸŽ‚/g, replacement: '🎂' },
  
  // Symbols (usually after emojis with variation selectors)
  { pattern: /â™‚ï¸/g, replacement: '♂️' },
  { pattern: /â™‚/g, replacement: '♂' },
  
  // Dashes and quotes (Latin-1 to proper punctuation)
  { pattern: /â€"/g, replacement: '—' },  // em dash
  { pattern: /â€™/g, replacement: "'" }, // right single quote
  { pattern: /â€œ/g, replacement: '"' }, // left double quote
  { pattern: /â€\u009d/g, replacement: '"' }, // right double quote
  
  // Dots and separators
  { pattern: /Â·/g, replacement: '·' },
  
  // Arrows and shapes
  { pattern: /â–"/g, replacement: '▶' },
  { pattern: /â–¼/g, replacement: '▼' },
  { pattern: /â–²/g, replacement: '▲' },
  { pattern: /â–/g, replacement: '•' },
  
  // Checkmarks and sparkles
  { pattern: /âœ¨/g, replacement: '✨' },
  { pattern: /âœ"/g, replacement: '✓' },
  
  // Electrical and warnings
  { pattern: /âš¡/g, replacement: '⚡' },
  { pattern: /âš /g, replacement: '⚠️' },
];

/**
 * Fix mojibake in a single file
 */
function fixMojibakeInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  for (const { pattern, replacement } of fixPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      fixCount += matches.length;
      content = content.replace(pattern, replacement);
    }
  }

  if (content !== originalContent) {
    if (shouldWrite) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    return fixCount;
  }
  
  return 0;
}

let totalMojibake = 0;
const fileResults = [];

console.log(isDry ? '🔍 Running in DRY mode (no changes)' : '✍️  Writing fixes...');
console.log('');

for (const relPath of filesToCheck) {
  const fullPath = path.resolve(projectRoot, relPath);
  const count = fixMojibakeInFile(fullPath);
  
  if (count > 0) {
    totalMojibake += count;
    fileResults.push({ file: relPath, count });
    console.log(`  ${relPath}: ${count} sequence(s)`);
  }
}

console.log('');
if (fileResults.length === 0) {
  console.log('✅ No mojibake sequences found.');
  process.exit(0);
} else {
  console.log(`📊 Total: ${totalMojibake} garbled sequence(s) in ${fileResults.length} file(s)`);
  if (isDry) {
    console.log('');
    console.log('To fix, run: node scripts/fix-mojibake.mjs --write');
    console.log('Then verify: node scripts/fix-mojibake.mjs');
  } else {
    console.log('');
    console.log('✅ Fixed! Run a dry check to verify: node scripts/fix-mojibake.mjs');
  }
  process.exit(0);
}
