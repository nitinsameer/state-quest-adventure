#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

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

let checked = 0;
let failed = 0;

// Real mojibake patterns: emoji codes read as Latin-1 bytes
// When UTF-8 F0 9F XX XX is wrongly treated as 4 Latin-1 chars,
// it produces the byte sequences shown here
const realMojibakePatterns = [
  Buffer.from([0xef, 0xbf, 0xbd]), // replacement character (invalid UTF-8)
];

// Also check for incomplete UTF-8 sequences at end of file
function isValidUTF8(buffer) {
  let i = 0;
  while (i < buffer.length) {
    const byte = buffer[i];
    let seqLen;
    
    if ((byte & 0x80) === 0) {
      seqLen = 1;
    } else if ((byte & 0xe0) === 0xc0) {
      seqLen = 2;
    } else if ((byte & 0xf0) === 0xe0) {
      seqLen = 3;
    } else if ((byte & 0xf8) === 0xf0) {
      seqLen = 4;
    } else {
      // Invalid start byte
      return false;
    }
    
    if (i + seqLen > buffer.length) {
      // Incomplete sequence at end
      return false;
    }
    
    for (let j = 1; j < seqLen; j++) {
      if ((buffer[i + j] & 0xc0) !== 0x80) {
        // Invalid continuation byte
        return false;
      }
    }
    
    i += seqLen;
  }
  
  return true;
}

console.log('Checking file encodings...');

for (const checkDir of checkDirs) {
  const files = scanDir(path.join(projectRoot, checkDir));
  for (const filePath of files) {
    checked++;
    const buffer = fs.readFileSync(filePath);
    
    // Check for real mojibake patterns
    let isBad = false;
    for (const pattern of realMojibakePatterns) {
      if (buffer.includes(pattern)) {
        isBad = true;
        break;
      }
    }
    
    // Also validate UTF-8 integrity
    if (!isBad) {
      isBad = !isValidUTF8(buffer);
    }
    
    if (isBad) {
      failed++;
      console.log('FAIL: ' + path.relative(projectRoot, filePath));
    }
  }
}

console.log('Checked ' + checked + ' files');
if (failed > 0) {
  console.log('FAILED: ' + failed + ' file(s) with encoding issues');
  process.exit(1);
} else {
  console.log('OK: All files clean');
  process.exit(0);
}
