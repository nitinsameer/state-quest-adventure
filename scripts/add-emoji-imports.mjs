#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const filesNeedingEmojiImport = [
  'src/components/AudioTestScreen.tsx',
  'src/components/DebugScreen.tsx',
  'src/components/ExpandableCard.tsx',
  'src/components/HomeScreen.tsx',
  'src/components/PassportMightyTree.tsx',
  'src/components/PassportSapling.tsx',
  'src/components/PassportSprout.tsx',
  'src/components/PostcardFrame.tsx',
  'src/components/PostcardScreen.tsx',
  'src/components/QuizAnswerFeedback.tsx',
  'src/components/state-performance-badge-modal.tsx',
  'src/components/state-performance-badges-view.tsx',
  'src/components/StateCompletionCelebration.tsx',
  'src/components/UnlockCelebration.tsx',
];

for (const file of filesNeedingEmojiImport) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has EMOJI import
    if (content.includes('import { EMOJI }') || content.includes("from '@/constants/emoji'")) {
      console.log(`✓ Already has import: ${file}`);
      continue;
    }
    
    // Find the first import statement
    const importMatch = content.match(/^import/m);
    if (!importMatch) continue;
    
    // Find the index right after the first import line or block
    const lastImportMatch = content.match(/^import\s+[^;]+;/gm);
    if (!lastImportMatch || lastImportMatch.length === 0) continue;
    
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    const insertIndex = content.indexOf(lastImport) + lastImport.length;
    
    // Add the EMOJI import
    const importStatement = '\nimport { EMOJI } from "@/constants/emoji";';
    content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Added import: ${file}`);
  } catch (error) {
    console.error(`✗ Error in ${file}: ${error.message}`);
  }
}

console.log('\n✅ Emoji imports added!');
