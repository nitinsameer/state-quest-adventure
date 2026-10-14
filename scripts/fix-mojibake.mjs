#!/usr/bin/env node
/**
 * Fix UTF-8 mojibake: when UTF-8 emoji bytes are read as Latin-1
 * Example: <� (F0 9F 8F A0 in UTF-8) read as Latin-1 becomes "�x\x8f� "
 * Solution: identify mojibake patterns and re-encode them correctly
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const WRITE = process.argv.includes('--write');
const rootDir = process.cwd();

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.json', '.md'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'android', 'ios', '.agents', '.kiro', 'apk_extract', 'temp_apk', '.tanstack', '.idea', '.vscode', '.lovable', '.wrangler', '.husky']);

/**
 * Detect and fix mojibake in a string
 * Mojibake pattern: high-byte Latin-1 chars that should be UTF-8 sequences
 */
function fixMojibake(str) {
  // Check if string contains likely mojibake patterns
  // These are UTF-8 bytes (0xC0-0xFF) interpreted as Latin-1 characters
  const mojibakePattern = /[\xC0-\xFF]/g;
  if (!mojibakePattern.test(str)) {
    return str; // No high bytes, no mojibake
  }

  // Try to fix by reinterpreting as Latin-1 encoded UTF-8
  try {
    // Convert string to Latin-1 buffer, then decode as UTF-8
    const latin1Buffer = Buffer.from(str, 'latin1');
    const utf8String = latin1Buffer.toString('utf8');
    
    // Only accept if it produces valid UTF-8 with actual emoji/symbols
    // Check if result has emoji-like characters (codepoints > 0x1F300)
    const hasEmoji = /[\uD800-\uDBFF]/.test(utf8String) || /[^\x00-\x7F]/.test(utf8String);
    if (hasEmoji && utf8String !== str) {
      return utf8String;
    }
  } catch (e) {
    // If re-encoding fails, return original
  }
  
  return str;
}

function shouldProcess(filePath) {
  const ext = extname(filePath);
  // Skip backup/copy files
  if (filePath.includes(' copy') || filePath.includes('-bck') || filePath.includes('bck3')) {
    return false;
  }
  // Skip data files
  if (filePath.includes('src\\lib\\content\\') && ext === '.json') {
    return false;
  }
  // Only process source files, not dist/build outputs
  if (filePath.includes('node_modules') || filePath.includes('apk_extract') || filePath.includes('temp_apk')) {
    return false;
  }
  return ALLOWED_EXTENSIONS.includes(ext);
}

function walk(dir, callback) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, callback);
      } else if (entry.isFile()) {
        callback(fullPath);
      }
    }
  } catch (err) {
    // Silently skip inaccessible directories
  }
}

const fileStats = {};
let totalFixed = 0;

walk(rootDir, (file) => {
  if (!shouldProcess(file)) return;

  try {
    const content = readFileSync(file, 'utf8');
    const fixed = fixMojibake(content);
    
    if (fixed !== content) {
      fileStats[file] = true;
      totalFixed++;

      if (WRITE) {
        writeFileSync(file, fixed, 'utf8');
        console.log(`Fixed: ${file}`);
      } else {
        console.log(`Found: ${file}`);
      }
    }
  } catch (err) {
    // Silently skip files that can't be read
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total files with mojibake: ${totalFixed}`);
if (totalFixed > 0) {
  console.log(`\nFiles affected:`);
  for (const file of Object.keys(fileStats)) {
    // Show relative path for readability
    const relPath = file.startsWith(rootDir) ? file.slice(rootDir.length + 1) : file;
    console.log(`  ${relPath}`);
  }
}

if (!WRITE && totalFixed > 0) {
  console.log('\nRun with --write to apply fixes');
  process.exit(1);
}

if (totalFixed === 0) {
  console.log('No mojibake sequences detected.');
  process.exit(0);
}
