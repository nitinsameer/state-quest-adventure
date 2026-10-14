import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const WRITE = process.argv.includes('--write');
const rootDir = process.argv.find(arg => !arg.startsWith('-') && !arg.endsWith('.mjs')) || process.cwd();

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.json', '.md'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'android', 'ios', '.agents']);

// Mojibake detection: UTF-8 bytes misinterpreted as Latin-1
// This matches patterns like: ðŸ (d0 9f), â˜ (c2 98), etc.
// Specific mojibake patterns to fix
const MOJIBAKE_PATTERNS = [
  // UTF-8 emoji like 🏠 (F0 9F 8F A0) misread as Latin-1: ðŸ 
  [/ðŸ(.)/g, (match) => {
    const code = match.charCodeAt(1);
    if (code >= 0x80) {
      // This is mojibake - bytes were read as Latin-1 instead of UTF-8
      try {
        const bytes = Buffer.from(match, 'latin1').toString('utf8');
        return bytes;
      } catch {
        return match;
      }
    }
    return match;
  }],
  // â, Â sequences (common UTF-8 mojibake)
  [/â(.)/g, (match) => {
    try {
      return Buffer.from(match, 'latin1').toString('utf8');
    } catch {
      return match;
    }
  }],
  // Ã (another mojibake pattern)
  [/Ã(.)/g, (match) => {
    try {
      return Buffer.from(match, 'latin1').toString('utf8');
    } catch {
      return match;
    }
  }],
];

function fixMojibake(str) {
  let result = str;
  for (const [pattern, replacer] of MOJIBAKE_PATTERNS) {
    result = result.replace(pattern, replacer);
  }
  return result;
}

function shouldProcess(filePath) {
  const ext = extname(filePath);
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
    console.error(`Error walking directory ${dir}:`, err.message);
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
      // Count how many replacements were made by comparing character differences
      const matches = content.match(/ðŸ|â|Ã/g) || [];
      fileStats[file] = matches.length;
      totalFixed += matches.length;

      if (WRITE) {
        writeFileSync(file, fixed, 'utf8');
        console.log(`Fixed: ${file} (${matches.length} sequences)`);
      } else {
        console.log(`Found: ${file} (${matches.length} sequences)`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total mojibake sequences found: ${totalFixed}`);
if (Object.keys(fileStats).length > 0) {
  console.log(`\nFiles affected:`);
  for (const [file, count] of Object.entries(fileStats)) {
    console.log(`  ${file}: ${count}`);
  }
}

if (!WRITE && totalFixed > 0) {
  process.exit(1);
}

if (totalFixed === 0) {
  console.log('No mojibake sequences detected.');
  process.exit(0);
}
