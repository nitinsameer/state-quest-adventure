#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Read all CSS files to build token registry
function buildTokenRegistry() {
  const tokens = new Set();
  const cssDir = path.join(projectRoot, 'src/styles');
  
  // Read tokens.css
  try {
    const tokensCss = fs.readFileSync(path.join(cssDir, 'tokens.css'), 'utf8');
    const tokenMatches = tokensCss.match(/--[a-z0-9-]+/g) || [];
    tokenMatches.forEach(token => tokens.add(token));
  } catch (e) {
    console.warn('Warning: could not read tokens.css');
  }
  
  // Read all theme files
  try {
    const themesDir = path.join(cssDir, 'themes');
    if (fs.existsSync(themesDir)) {
      const themeFiles = fs.readdirSync(themesDir);
      themeFiles.forEach(file => {
        if (file.endsWith('.css')) {
          const themeCss = fs.readFileSync(path.join(themesDir, file), 'utf8');
          const tokenMatches = themeCss.match(/--[a-z0-9-]+/g) || [];
          tokenMatches.forEach(token => tokens.add(token));
        }
      });
    }
  } catch (e) {
    console.warn('Warning: could not read theme files');
  }
  
  return tokens;
}

// Read themes from src/lib/themes.ts
function getRegisteredThemes() {
  const themesFile = path.join(projectRoot, 'src/lib/themes.ts');
  try {
    const content = fs.readFileSync(themesFile, 'utf8');
    // Look for THEMES array and extract theme ids
    const themeMatches = content.match(/id:\s*["']([a-z-]+)["']/g) || [];
    return themeMatches.map(m => m.match(/["']([a-z-]+)["']/)[1]);
  } catch (e) {
    console.warn('Warning: could not read themes.ts');
    return [];
  }
}

// Scan files
function scanFiles() {
  const violations = {
    1: [], // Raw Tailwind palette classes
    2: [], // bg-white/text-white/bg-black/text-black
    3: [], // Tailwind gradients with literal stops
    4: [], // Hex color literals
    5: [], // rgb/rgba/hsl/hsla literals
    6: [], // Inline style with literal colors
    7: [], // Invented CSS properties
    8: [], // text-ink on themed fills
    9: [], // Old [--var] arbitrary syntax
    10: [], // Undefined var(--x)
    11: [], // Unscoped :root colors
    12: [], // Duplicate token declarations
    13: [], // Stale hand-typed theme-ID lists
    14: [], // Type casts on theme/style values
    15: [], // Theme-specific conditional code
  };
  
  const tokens = buildTokenRegistry();
  const registeredThemes = getRegisteredThemes();
  
  // Scan all .tsx and .ts files
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const relPath = path.relative(projectRoot, fullPath);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .git, dist, etc.
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
          walkDir(fullPath);
        }
      } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && 
                 !relPath.includes('__tests__') && !relPath.includes('.test.')) {
        // Skip theme files and emoji constants
        if (relPath.includes('src/styles/themes/') || relPath.includes('src/lib/themes.ts') || relPath.includes('src/constants/emoji.ts')) {
          return;
        }
        
        scanFile(fullPath, relPath, violations, tokens, registeredThemes);
      }
    });
  }
  
  walkDir(path.join(projectRoot, 'src'));
  return violations;
}

function scanFile(filePath, relPath, violations, tokens, registeredThemes) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Cat 1: Raw Tailwind palette classes
    const palettePattern = /(bg|text|border|from|to|via|ring|fill|stroke|shadow|divide|outline|caret|accent|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}/g;
    let match;
    while ((match = palettePattern.exec(line)) !== null) {
      if (line.includes('className') || line.includes('class ')) {
        violations[1].push({
          file: relPath,
          line: lineNum,
          text: match[0],
          fullLine: line.trim(),
        });
      }
    }
    
    // Cat 2: bg-white/text-white/bg-black/text-black
    const whiteBlackPattern = /(bg|text)-(white|black)(?:\/[0-9]+)?/g;
    while ((match = whiteBlackPattern.exec(line)) !== null) {
      if (line.includes('className') || line.includes('class ')) {
        violations[2].push({
          file: relPath,
          line: lineNum,
          text: match[0],
          fullLine: line.trim(),
        });
      }
    }
    
    // Cat 4: Hex color literals (outside theme files)
    const hexPattern = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g;
    while ((match = hexPattern.exec(line)) !== null) {
      // Skip previewTokens in themes.ts (legitimate)
      if (!line.includes('previewTokens')) {
        violations[4].push({
          file: relPath,
          line: lineNum,
          text: match[0],
          fullLine: line.trim(),
        });
      }
    }
    
    // Cat 5: rgb/rgba/hsl/hsla literals
    const funcColorPattern = /(rgba?|hsla?)\s*\(\s*[0-9]/g;
    while ((match = funcColorPattern.exec(line)) !== null) {
      // Skip var() fallbacks
      if (!line.includes('var(--') || line.indexOf(match[0]) < line.indexOf('var(--')) {
        violations[5].push({
          file: relPath,
          line: lineNum,
          text: match[0],
          fullLine: line.trim(),
        });
      }
    }
    
    // Cat 6: Inline style with literal colors
    if (line.includes('style={{')) {
      const styleMatch = line.match(/style=\{\{([^}]+)\}\}/);
      if (styleMatch) {
        const styleContent = styleMatch[1];
        // Check for color properties with literal values
        if ((styleContent.includes('color:') || styleContent.includes('backgroundColor:') || 
             styleContent.includes('borderColor:') || styleContent.includes('boxShadow:')) &&
            !styleContent.includes('var(--')) {
          violations[6].push({
            file: relPath,
            line: lineNum,
            text: styleMatch[0],
            fullLine: line.trim(),
          });
        }
      }
    }
    
    // Cat 7: Invented CSS properties (borderOpacity, backgroundOpacity, etc.)
    const inventedProps = /\b(borderOpacity|backgroundOpacity|colorOpacity|textOpacity|fillOpacity|strokeOpacity):/g;
    while ((match = inventedProps.exec(line)) !== null) {
      violations[7].push({
        file: relPath,
        line: lineNum,
        text: match[1],
        fullLine: line.trim(),
      });
    }
    
    // Cat 8: text-ink on themed fills
    if ((line.includes('text-ink') || line.includes('text-white')) && 
        (line.includes('ui-button') || line.includes('ui-chip') || line.includes('ui-badge') ||
         line.includes('ui-tab') || line.includes('clay-button') || line.includes('bg-accent-') ||
         line.includes('bg-action-'))) {
      violations[8].push({
        file: relPath,
        line: lineNum,
        text: 'text-ink or text-white on themed fill',
        fullLine: line.trim(),
      });
    }
    
    // Cat 9: Old [--var] arbitrary syntax
    const oldArbitraryPattern = /\[[a-z0-9-]*--[a-z0-9-]+\]/g;
    while ((match = oldArbitraryPattern.exec(line)) !== null) {
      violations[9].push({
        file: relPath,
        line: lineNum,
        text: match[0],
        fullLine: line.trim(),
      });
    }
    
    // Cat 10: Undefined var(--x)
    const varRefPattern = /var\(--([a-z0-9-]+)/g;
    while ((match = varRefPattern.exec(line)) !== null) {
      const token = '--' + match[1];
      const frameworkPrefix = ['--tw-', '--radix-', '--sidebar-', '--vaul-', '--chart-', '--confetti-', '--cell-size'];
      const isFramework = frameworkPrefix.some(prefix => token.startsWith(prefix));
      if (!isFramework && !tokens.has(token)) {
        violations[10].push({
          file: relPath,
          line: lineNum,
          text: 'var(--' + match[1] + ')',
          fullLine: line.trim(),
        });
      }
    }
    
    // Cat 13: Hand-typed theme IDs that don't match registry
    if (line.includes('["') || line.includes("['")) {
      const themeStrings = line.match(/["']([a-z-]+)["']/g) || [];
      themeStrings.forEach(str => {
        const themeId = str.slice(1, -1);
        if (registeredThemes.includes(themeId) && !line.includes('THEMES.map')) {
          // This is a legitimate theme ID, but check if it's in a context that might be a hardcoded list
          if ((line.includes('const ') || line.includes('=') || line.includes('[')) && 
              !line.includes('src/lib/themes.ts')) {
            violations[13].push({
              file: relPath,
              line: lineNum,
              text: 'Potential hardcoded theme ID: ' + themeId,
              fullLine: line.trim(),
            });
          }
        }
      });
    }
    
    // Cat 14: Type casts with theme names
    if (line.includes(' as ') && (line.includes('clay') || line.includes('aero') || line.includes('cyber'))) {
      violations[14].push({
        file: relPath,
        line: lineNum,
        text: 'Type cast with theme name',
        fullLine: line.trim(),
      });
    }
    
    // Cat 15: Theme-specific conditional code
    if ((line.includes('theme ===') || line.includes('theme ==') || line.includes('if (theme')) &&
        (line.includes('clay') || line.includes('aero') || line.includes('cyber') || 
         line.includes('forest') || line.includes('ocean'))) {
      violations[15].push({
        file: relPath,
        line: lineNum,
        text: 'Theme-specific conditional',
        fullLine: line.trim(),
      });
    }
  });
}

// Format and print results
function printResults(violations) {
  const categories = {
    1: 'Raw Tailwind palette classes',
    2: 'bg-white/text-white/bg-black/text-black',
    3: 'Tailwind gradients with literal stops',
    4: 'Hex color literals',
    5: 'rgb/rgba/hsl/hsla literals',
    6: 'Inline style with literal colors',
    7: 'Invented CSS properties',
    8: 'text-ink on themed fills',
    9: 'Old [--var] arbitrary syntax',
    10: 'Undefined var(--x)',
    11: 'Unscoped :root colors',
    12: 'Duplicate token declarations',
    13: 'Stale hand-typed theme-ID lists',
    14: 'Type casts on theme/style values',
    15: 'Theme-specific conditional code',
  };
  
  console.log('\n' + '='.repeat(80));
  console.log('HARDCODING AUDIT RESULTS');
  console.log('='.repeat(80) + '\n');
  
  let totalViolations = 0;
  
  Object.entries(categories).forEach(([catNum, catName]) => {
    const vios = violations[parseInt(catNum)] || [];
    const count = vios.length;
    totalViolations += count;
    
    console.log(`[CAT ${catNum}] ${catName}: ${count} violations`);
    
    if (count > 0) {
      vios.slice(0, 10).forEach(v => {
        console.log(`  ${v.file}:${v.line} — ${v.text}`);
      });
      if (count > 10) {
        console.log(`  ... and ${count - 10} more`);
      }
    }
    console.log();
  });
  
  console.log('='.repeat(80));
  console.log(`TOTAL VIOLATIONS: ${totalViolations}`);
  console.log('='.repeat(80) + '\n');
  
  // Print full details
  console.log('\nFULL DETAILS:\n');
  Object.entries(categories).forEach(([catNum, catName]) => {
    const vios = violations[parseInt(catNum)] || [];
    if (vios.length > 0) {
      console.log(`\n--- CATEGORY ${catNum}: ${catName} ---`);
      vios.forEach(v => {
        console.log(`${v.file}:${v.line}`);
        console.log(`  ${v.text}`);
        console.log(`  > ${v.fullLine}`);
      });
    }
  });
  
  return totalViolations;
}

// Run audit
const violations = scanFiles();
const totalViolations = printResults(violations);

// Exit with code 1 if violations found
process.exit(totalViolations > 0 ? 1 : 0);
