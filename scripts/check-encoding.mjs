import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const rootDir = process.argv[2] || process.cwd();

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.json', '.md'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'android', 'ios', '.agents']);

// Mojibake detection regex: Latin-1 high bytes followed by continuation bytes
const MOJIBAKE_REGEX = /[\xc0-\xff][\x80-\xbf]+/g;

// Emoji mojibake detection: Actual emoji (U+1F300-U+1F9FF, U+2600-U+27BF, etc) followed by suspicious Latin-1 sequences
// This catches UTF-8 double-encoding corruption like "🏆"¥" where an emoji is followed by quotation marks + high bytes
// Pattern: Common emoji ranges followed by quotation + Latin-1 high bytes OR Latin-1 control chars
// We focus on: quotation marks (U+201C, U+201D, U+2018, U+2019) followed by high bytes (U+00A0-U+00FF)
// OR: emoji followed by Latin-1 control characters (U+0080-U+009F)
const EMOJI_MOJIBAKE_REGEX = /(🏆|🎨|🦁|🎯|🏅|🌍|✨|🎉)[\u201C\u201D\u2018\u2019\u008F\u0090\u008D][\u00A0-\u00FF\u203A\uFE0F]?/ug;

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
    
    // Check for general mojibake (Latin-1 high bytes + continuation bytes)
    if (MOJIBAKE_REGEX.test(content)) {
      console.log(`MOJIBAKE DETECTED: ${file}`);
      hasIssues = true;
    }
    
    // Check for emoji mojibake (emoji followed by Latin-1 high bytes)
    // This catches cases like "🏆"¥" where UTF-8 was double-encoded
    const emojiMatches = content.matchAll(EMOJI_MOJIBAKE_REGEX);
    const lines = content.split('\n');
    
    for (const match of emojiMatches) {
      // Find approximate line number
      const position = match.index;
      let lineNum = 1;
      let charCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
        if (charCount > position) {
          lineNum = i + 1;
          break;
        }
      }
      
      console.log(`EMOJI MOJIBAKE DETECTED: ${file}:${lineNum}`);
      console.log(`  Found: ${match[0]} (emoji followed by high byte)`);
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
