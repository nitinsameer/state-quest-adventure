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

const fixPatterns = [
  { pattern: /HOME /g, replacement: 'HOME ' },
  { pattern: /MAP/g, replacement: 'MAP' },
  { pattern: /SEARCH/g, replacement: 'SEARCH' },
  { pattern: /TROPHY/g, replacement: 'TROPHY' },
  { pattern: /TROPHY2/g, replacement: 'TROPHY2' },
  { pattern: /PAW/g, replacement: 'PAW' },
  { pattern: /USER/g, replacement: 'USER' },
  { pattern: /SEEDLING/g, replacement: 'SEEDLING' },
  { pattern: /LEAVES/g, replacement: 'LEAVES' },
  { pattern: /TREE/g, replacement: 'TREE' },
  { pattern: /TREE2/g, replacement: 'TREE2' },
  { pattern: /PARTY/g, replacement: 'PARTY' },
  { pattern: /CELEBRATE/g, replacement: 'CELEBRATE' },
  { pattern: /STAR/g, replacement: 'STAR' },
  { pattern: /SEARCH¥/g, replacement: 'FIRE' },
  { pattern: /LIGHTBULB/g, replacement: 'LIGHTBULB' },
  { pattern: /TARGET/g, replacement: 'TARGET' },
  { pattern: /WARNING/g, replacement: 'WARNING' },
  { pattern: /GLOBE/g, replacement: 'GLOBE' },
  { pattern: /—/g, replacement: '—' },
  { pattern: /'/g, replacement: "'" },
  { pattern: /"/g, replacement: '"' },
  { pattern: /·/g, replacement: '·' },
  { pattern: /▶/g, replacement: '▶' },
  { pattern: /▼/g, replacement: '▼' },
  { pattern: /▲/g, replacement: '▲' },
  { pattern: /•/g, replacement: '•' },
  { pattern: /SPARKLES/g, replacement: 'SPARKLES' },
  { pattern: /CHECK/g, replacement: 'CHECK' },
  { pattern: /LIGHTNING/g, replacement: 'LIGHTNING' },
  { pattern: /WARNING2/g, replacement: 'WARNING2' },
];

let totalFixed = 0;

for (const checkDir of checkDirs) {
  const files = scanDir(path.join(projectRoot, checkDir));
  for (const filePath of files) {
    const buffer = fs.readFileSync(filePath);
    let hasCorruption = false;
    
    const corrupted = [
      Buffer.from([0xd0, 0x9f]),
      Buffer.from([0xc2, 0xa0]),
      Buffer.from([0xc2, 0xb7]),
    ];
    
    for (const seq of corrupted) {
      if (buffer.includes(seq)) {
        hasCorruption = true;
        break;
      }
    }
    
    if (hasCorruption) {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;
      
      for (const { pattern, replacement } of fixPatterns) {
        content = content.replace(pattern, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed++;
        console.log('Fixed: ' + path.relative(projectRoot, filePath));
      }
    }
  }
}

console.log('Total files fixed: ' + totalFixed);
process.exit(0);
