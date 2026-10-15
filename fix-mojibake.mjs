import fs from 'fs';
import path from 'path';

const files = [
  'src/components/screens.tsx',
  'src/components/ceremony/QuizCeremony.tsx'
];

const replacements = [
  // Arrows
  ['â†'', '→'],
  ['â†', '←'],
  // Checkmarks
  ['âœ"', '✓'],
  ['âœ…', '✅'],
  // Other emoji
  ['âœˆï¸', '✈️'],
  ['âš™ï¸', '⚙️'],
  ['âœï¸', '✏️'],
  // Trophy corruptions
  ['🏆†', '🏆'],
  ['🏆'‹', '🏆'],
  ['🏆"¥', '🏆'],
  ['🏆"'', '🏆'],
  ['🏆'€', '🏆'],
  ['🏆"', '🏆'],
  // Fire emoji corruption
  ['�x¥', '🔥'],
  ['◆×'¥', '🔥'],
];

let totalFixes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fileFixCount = 0;
  
  replacements.forEach(([search, replace]) => {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      fileFixCount += matches.length;
      content = content.replace(regex, replace);
    }
  });
  
  if (fileFixCount > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Fixed ${fileFixCount} instances in ${file}`);
    totalFixes += fileFixCount;
  } else {
    console.log(`✓ No mojibake found in ${file}`);
  }
});

console.log(`\n✅ Total fixes applied: ${totalFixes}`);
