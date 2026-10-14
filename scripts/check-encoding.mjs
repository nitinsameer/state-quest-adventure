import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const rootDir = process.argv[2] || process.cwd();

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.json', '.md'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'android', 'ios', '.agents']);

// Mojibake detection regex: Latin-1 high bytes followed by continuation bytes
const MOJIBAKE_REGEX = /[\xc0-\xff][\x80-\xbf]+/g;

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
    // Silently skip inaccessible directories
  }
}

let hasIssues = false;

walk(rootDir, (file) => {
  if (!shouldProcess(file)) return;

  try {
    const content = readFileSync(file, 'utf8');
    if (MOJIBAKE_REGEX.test(content)) {
      console.log(`MOJIBAKE DETECTED: ${file}`);
      hasIssues = true;
    }
  } catch (err) {
    // Silently skip unreadable files
  }
});

if (!hasIssues) {
  console.log('Encoding check passed.');
  process.exit(0);
} else {
  process.exit(1);
}
