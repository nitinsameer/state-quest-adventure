#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const srcDir = path.join(projectRoot, 'src');
const tokensFile = path.join(projectRoot, 'src/styles/tokens.css');
const themesDir = path.join(projectRoot, 'src/styles/themes');

// Allowlist for runtime-set variables (set via setProperty)
const allowlist = [
  '--nav-h',
  '--header-h',
  '--sidebar-w',
  '--modal-z',
  '--toast-z',
];

/**
 * Parse CSS file and extract all defined token names
 */
function extractTokensFromCSS(filePath) {
  if (!fs.existsSync(filePath)) return new Set();
  
  const content = fs.readFileSync(filePath, 'utf8');
  const tokens = new Set();
  
  // Match CSS variable definitions: --name: value;
  const tokenRegex = /--[\w-]+(?=\s*:)/g;
  let match;
  while ((match = tokenRegex.exec(content)) !== null) {
    tokens.add(match[0]);
  }
  
  return tokens;
}

/**
 * Get all defined tokens from all theme files
 */
function getAllDefinedTokens() {
  const allTokens = new Set();
  
  // Get tokens from main tokens file
  const tokensFromFile = extractTokensFromCSS(tokensFile);
  tokensFromFile.forEach(t => allTokens.add(t));
  
  // Get tokens from all theme files
  if (fs.existsSync(themesDir)) {
    const themeFiles = fs.readdirSync(themesDir).filter(f => f.endsWith('.css'));
    for (const themeFile of themeFiles) {
      const themeTokens = extractTokensFromCSS(path.join(themesDir, themeFile));
      themeTokens.forEach(t => allTokens.add(t));
    }
  }
  
  return allTokens;
}

/**
 * Scan source files for CSS class references
 */
function scanSourceFiles() {
  const usedTokens = new Set();
  const undefinedTokens = new Set();
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
        scanFile(fullPath);
      }
    }
  }
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Match Tailwind classes in className="..." and class="..."
    const classRegex = /(?:className|class)=["'`]([^"'`]+)["'`]/g;
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      const classString = match[1];
      const classes = classString.split(/\s+/);
      
      for (const cls of classes) {
        if (cls.startsWith('text-') || cls.startsWith('bg-') || cls.startsWith('border-') || cls.startsWith('shadow-') || cls.startsWith('gap-') || cls.startsWith('space-')) {
          usedTokens.add(cls);
        }
      }
    }
    
    // Also match CSS var() references
    const varRegex = /var\(([^)]+)\)/g;
    while ((match = varRegex.exec(content)) !== null) {
      const varName = match[1].trim();
      usedTokens.add(varName);
    }
  }
  
  scanDir(srcDir);
  return usedTokens;
}

/**
 * Map Tailwind class names to CSS tokens
 */
function classNameToToken(className) {
  // For text-*, bg-*, border-* classes, construct the token name
  if (className.startsWith('text-')) {
    return `--color-${className.substring(5)}`;
  }
  if (className.startsWith('bg-')) {
    return `--color-${className.substring(3)}`;
  }
  if (className.startsWith('border-')) {
    return `--border-${className.substring(7)}`;
  }
  if (className.startsWith('shadow-')) {
    return `--shadow-${className.substring(7)}`;
  }
  if (className.startsWith('gap-')) {
    return `--gap-${className.substring(4)}`;
  }
  if (className.startsWith('space-')) {
    return `--space-${className.substring(6)}`;
  }
  
  return className; // Already a CSS variable
}

console.log('Checking for undefined tokens...\n');

// Get all defined tokens from CSS
const definedTokens = getAllDefinedTokens();
console.log(`Found ${definedTokens.size} defined tokens in CSS files`);

// Scan source files for used tokens
const usedTokens = scanSourceFiles();
console.log(`Found ${usedTokens.size} used tokens in source files\n`);

// Check for undefined tokens
const missingTokens = [];
for (const token of usedTokens) {
  // Skip allowlisted variables
  if (allowlist.includes(token)) continue;
  
  // Convert class name to token if needed
  const tokenName = token.startsWith('--') ? token : classNameToToken(token);
  
  if (!definedTokens.has(tokenName)) {
    missingTokens.push({ used: token, token: tokenName });
  }
}

if (missingTokens.length > 0) {
  console.log('FAIL: Undefined tokens found:');
  missingTokens.forEach(item => {
    console.log(`  ${item.used} (expected: ${item.token})`);
  });
  process.exit(1);
} else {
  console.log('OK: All used tokens are defined');
  process.exit(0);
}
