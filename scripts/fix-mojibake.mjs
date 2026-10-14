#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

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

const fixPatterns = [
  { pattern: /HOME /g, replacement: 'EMOJI_HOME ' },
  { pattern: /MAP/g, replacement: 'EMOJI_MAP' },
  { pattern: /SEARCH/g, replacement: 'EMOJI_SEARCH' },
  { pattern: /TROPHY/g, replacement: 'EMOJI_TROPHY' },
  { pattern: /TROPHY2/g, replacement: 'EMOJI_TROPHY2' },
  { pattern: /PAW/g, replacement: 'EMOJI_PAW' },
  { pattern: /USER/g, replacement: 'EMOJI_USER' },
  { pattern: /ðŸŒ±/g, replacement: 'EMOJI_SEEDLING' },
  { pattern: /ðŸŒ¿/g, replacement: 'EMOJI_LEAVES' },
  { pattern: /ðŸŒ³/g, replacement: 'EMOJI_TREE' },
  { pattern: /TREE2/g, replacement: 'EMOJI_TREE2' },
  { pattern: /ðŸŎ /g, replacement: 'EMOJI_PARTY' },
  { pattern: /CELEBRATE/g, replacement: 'EMOJI_CELEBRATE' },
  { pattern: /ðŸŒŸ/g, replacement: 'EMOJI_STAR' },
  { pattern: /SEARCH¥/g, replacement: 'EMOJI_FIRE' },
  { pattern: /LIGHTBULB/g, replacement: 'EMOJI_LIGHTBULB' },
  { pattern: /TARGET/g, replacement: 'EMOJI_TARGET' },
  { pattern: /WARNING/g, replacement: 'EMOJI_WARNING' },
  { pattern: /ðŸŒ/g, replacement: 'EMOJI_GLOBE' },
  { pattern: /—/g, replacement: '—' },
  { pattern: /'/g, replacement: "'" },
  { pattern: /"/g, replacement: '"' },
  { pattern: /·/g, replacement: '·' },
  { pattern: /▶/g, replacement: '▶' },
  { pattern: /▼/g, replacement: '▼' },
  { pattern: /▲/g, replacement: '▲' },
  { pattern: /•/g, replacement: '•' },
  { pattern: /SPARKLES/g, replacement: 'EMOJI_SPARKLES' },
  { pattern: /CHECK/g, replacement: 'EMOJI_CHECK' },
  { pattern: /LIGHTNING/g, replacement: 'EMOJI_LIGHTNING' },
  { pattern: /WARNING2/g, replacement: 'EMOJI_WARNING2' },
];

function fixMojibakeInFile(filePath) {
  if (!fs.existsSync(filePath)) return 0;
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

  if (content !== originalContent && shouldWrite) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return fixCount;
}

let totalMojibake = 0;
const fileResults = [];

console.log(isDry ? 'DRY mode' : 'WRITING FIXES');

for (const relPath of filesToCheck) {
  const fullPath = path.resolve(projectRoot, relPath);
  const count = fixMojibakeInFile(fullPath);
  if (count > 0) {
    totalMojibake += count;
    fileResults.push({ file: relPath, count });
  }
}

console.log('Total mojibake: ' + totalMojibake + ' in ' + fileResults.length + ' files');
process.exit(0);
