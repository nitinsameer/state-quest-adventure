#!/usr/bin/env node
/**
 * Check that source files don't contain UTF-8 mojibake sequences.
 * Exit 0 if OK, exit 1 if issues found.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Detect mojibake by checking for the specific byte patterns that indicate corruption
// These are the exact byte sequences we see when UTF-8 is misinterpreted as Latin-1
const corruptedByteSequences = [
  Buffer.from([0xd0, 0x9f]), // ðŸ in latin1 = corrupted emoji start
  Buffer.from([0xc2, 0xa0]), // â  in latin1 = corrupted symbol
  Buffer.from([0xc2, 0xb7]), // Â· in latin1 = corrupted middle dot
];

const checkDirs = ['src', 'scripts'];
const extensions = ['.ts', '.tsx', '.js', '.mjs', '.jsx', '.css'];

function scanDir(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDir(fullPath));
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

let checked = 0, failed = 0;
console.log('Checking file encodings...\n');

for (const checkDir of checkDirs) {
  const files = scanDir(path.join(projectRoot, checkDir));
  for (const filePath of files) {
    checked++;
    const buffer = fs.readFileSync(filePath);
    let hasCorruption = false;
    
    for (const seq of corruptedByteSequences) {
      if (buffer.includes(seq)) {
        hasCorruption = true;
        break;
      }
    }
    
    if (hasCorruption) {
      failed++;
      console.error(`  ❌ ${path.relative(projectRoot, filePath)}`);
    }
  }
}

console.log(`\nChecked ${checked} files`);
if (failed > 0) {
  console.error(`❌ FAILED: ${failed} file(s) with encoding issues\n`);
  process.exit(1);
} else {
  console.log('✅ All files OK\n');
  process.exit(0);
}
