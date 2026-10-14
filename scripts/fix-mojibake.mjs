#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Map of mojibake patterns to correct versions
// These are UTF-8 decoded incorrectly
const mojibakeFixes = [
  // screens.tsx
  { file: 'src/components/screens.tsx', pattern: /🎉 Saved [^\s]+"/, replace: '🎉 Saved ✓"' },
  { file: 'src/components/screens.tsx', pattern: /Continue [^\s]+ Let's Explore!/, replace: "Continue → Let's Explore!" },
  { file: 'src/components/screens.tsx', pattern: /âœ" Saved/, replace: '✓ Saved' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ† STATE MASTERED! ðŸ†/, replace: '🏆 STATE MASTERED! 🏆' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ"¥/, replace: '🔥' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ'/g, replace: '🔒' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ›️/g, replace: '🛖' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ¦/g, replace: '🦁' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ'¡/g, replace: '💡' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ""/g, replace: '🔔' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ" Locked/g, replace: '🔒 Locked' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ'€ Sneak Peek/g, replace: '👀 Sneak Peek' },
  { file: 'src/components/screens.tsx', pattern: /•¶ Play/g, replace: '▶ Play' },
  { file: 'src/components/screens.tsx', pattern: /ðŸŽ¯/g, replace: '🎯' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ/g, replace: '🏆' },
  { file: 'src/components/screens.tsx', pattern: /ðŸ''/g, replace: '👑' },
  { file: 'src/components/screens.tsx', pattern: /â€¹/g, replace: '‹' },
  { file: 'src/components/screens.tsx', pattern: /â€¹/g, replace: '‹' },
  { file: 'src/components/screens.tsx', pattern: /â€'/g, replace: '–' },
  { file: 'src/components/screens.tsx', pattern: /â€¦/g, replace: '…' },
  { file: 'src/components/screens.tsx', pattern: /â€œ/g, replace: '"' },
  { file: 'src/components/screens.tsx', pattern: /â€\x9d/g, replace: '"' },

  // PostcardScreen 
  { file: 'src/components/PostcardScreen.tsx', pattern: /â€œ/g, replace: '"' },
  { file: 'src/components/PostcardScreen.tsx', pattern: /[^\w]x[^\w][»›]/g, replace: '🛖' },

  // QuizCeremony
  { file: 'src/components/ceremony/QuizCeremony.tsx', pattern: /[^\w]x[^\w][†]/g, replace: '☆' },

  // state-performance-badge-modal
  { file: 'src/components/state-performance-badge-modal.tsx', pattern: /[^\w]x[^\w][†]/g, replace: '☆' },
];

let fixed = 0;

for (const { file, pattern, replace } of mojibakeFixes) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const before = content;
    content = content.replace(pattern, replace);
    
    if (content !== before) {
      fs.writeFileSync(filePath, content, 'utf-8');
      fixed++;
    }
  } catch (error) {
    console.error(`✗ Error in ${file}: ${error.message}`);
  }
}

console.log(`✅ Fixed ${fixed} mojibake patterns!`);
