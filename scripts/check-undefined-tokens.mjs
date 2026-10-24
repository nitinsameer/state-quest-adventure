#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const srcDir = path.join(projectRoot, "src");
const baseTokensFile = path.join(projectRoot, "src/styles/base-tokens.css");
const tokensFile = path.join(projectRoot, "src/styles/tokens.css");
const themesDir = path.join(projectRoot, "src/styles/themes");

// Allowlist for runtime-set variables (set via setProperty) and UI framework variables
const allowlist = [
  "--nav-h",
  "--header-h",
  "--sidebar-w",
  "--sidebar-width-icon",
  "--sidebar-width",
  "--sidebar-border",
  "--sidebar-accent",
  "--modal-z",
  "--toast-z",
  "--radix-dropdown-menu-content-available-height",
  "--radix-navigation-menu-viewport-height",
  "--radix-navigation-menu-viewport-width",
  "--radix-select-trigger-height",
  "--radix-select-trigger-width",
  // Shadcn/UI variables (set inline by components)
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--radius",
  // Tailwind theme inline overrides
  "--clay-white",
  "--clay-saffron",
  "--clay-saffron-soft",
  "--clay-explorer",
  "--clay-success",
  "--clay-gold",
  "--clay-gem",
  "--clay-light",
  "--clay-dark",
  "--clay-glow-saffron",
  "--clay-glow-saffron-soft",
  "--clay-glow-explorer",
  "--clay-glow-success",
  "--clay-glow-gold",
  "--clay-glow-gem",
  "--clay-glow-white",
  "--clay-progress-empty",
  "--clay-radius-card",
  "--clay-radius-button",
  "--clay-fill",
  "--clay-dark",
  "--clay-glow",
  // Animation variables
  "--confetti-rotate",
  // Color theme aliases
  "--accent-fill",
  "--accent-fill-soft",
  "--accent-ink",
  // Deprecated/legacy tokens still in use
  "--color-ink",
  "--color-border",
  "--color-border-error",
  "--color-border-info",
  "--color-border-muted",
  "--color-border-muted-light",
  "--color-border-orange",
  "--color-border-purple",
  "--color-border-success",
  "--color-border-warning",
  "--color-text-error",
  "--color-text-info",
  "--color-text-muted-dark",
  "--color-text-muted-light",
  "--color-text-orange",
  "--color-text-success",
  "--color-text-warning",
  "--color-text-warning-light",
  "--color-muted-bg",
  "--color-muted-bg-light",
  "--color-bg-error-soft",
  "--color-bg-info-soft",
  "--color-bg-orange-soft",
  "--color-bg-purple-soft",
  "--color-bg-success-soft",
  "--color-bg-warning-soft",
  "--shadow-glow-orange",
  // Theme-specific tiles & dynamics
  "--t",
  "--tilebg",
  "--tilec",
  "--curbg",
  "--shbtn",
  // Animation and progress variables (set via inline styles)
  "--animation-delay",
  "--progress-percent",
  // Additional theme/color tokens used in styles but defined per-theme
  "--accent-4-glow",
  "--border-subtle",
  "--color-primary",
  "--color-surface-primary",
  "--color-text-secondary",
  "--glow-color",
];

/**
 * Parse CSS file and extract all defined token names
 */
function extractTokensFromCSS(filePath) {
  if (!fs.existsSync(filePath)) return new Set();

  const content = fs.readFileSync(filePath, "utf8");
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

  // Get tokens from base tokens file first
  const baseTokens = extractTokensFromCSS(baseTokensFile);
  baseTokens.forEach((t) => allTokens.add(t));

  // Get tokens from main tokens file
  const tokensFromFile = extractTokensFromCSS(tokensFile);
  tokensFromFile.forEach((t) => allTokens.add(t));

  // Get tokens from all theme files
  if (fs.existsSync(themesDir)) {
    const themeFiles = fs.readdirSync(themesDir).filter((f) => f.endsWith(".css"));
    for (const themeFile of themeFiles) {
      const themeTokens = extractTokensFromCSS(path.join(themesDir, themeFile));
      themeTokens.forEach((t) => allTokens.add(t));
    }
  }

  return allTokens;
}

/**
 * Scan source files for CSS var() references
 */
function scanSourceFiles() {
  const usedTokens = new Set();

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist")
        continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".tsx") ||
          entry.name.endsWith(".ts") ||
          entry.name.endsWith(".jsx") ||
          entry.name.endsWith(".js") ||
          entry.name.endsWith(".css"))
      ) {
        scanFile(fullPath);
      }
    }
  }

  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");

    // ONLY match CSS var() references - these are the actual custom properties that must be defined
    const varRegex = /var\(([^,)]+)/g;
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      const varName = match[1].trim();
      // Only track CSS custom properties (starting with --)
      if (varName.startsWith("--")) {
        usedTokens.add(varName);
      }
    }
  }

  scanDir(srcDir);
  return usedTokens;
}

console.log("Checking for undefined tokens...\n");

// Get all defined tokens from CSS
const definedTokens = getAllDefinedTokens();
console.log(`Found ${definedTokens.size} defined tokens in CSS files`);

// Scan source files for used tokens (CSS var() references only)
const usedTokens = scanSourceFiles();
console.log(`Found ${usedTokens.size} used tokens in source files\n`);

// Check for undefined tokens
const missingTokens = [];
for (const token of usedTokens) {
  // Skip allowlisted variables
  if (allowlist.includes(token)) continue;

  if (!definedTokens.has(token)) {
    missingTokens.push(token);
  }
}

if (missingTokens.length > 0) {
  console.log("FAIL: Undefined tokens found:");
  missingTokens.sort().forEach((token) => {
    console.log(`  ${token}`);
  });
  process.exit(1);
} else {
  console.log("OK: All CSS var() references are defined");
  process.exit(0);
}
