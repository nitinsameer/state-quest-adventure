#!/usr/bin/env node
// check-theme-tokens.mjs — Prevent hardcoded colors from returning to the codebase
// Fails if src/ (outside allowlist) contains raw palette classes, hex literals, or gradient directives

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

const WORKSPACE = process.cwd();
const SRC_DIR = join(WORKSPACE, "src");
const BASELINE_FILE = join(WORKSPACE, "scripts", "theme-token-baseline.json");

// Files/patterns that are explicitly allowed to have palette colors
const ALLOWLIST = [
  "src/styles/tokens.css",
  "src/styles/index.css",
  "src/styles.css", // Allow comments documenting palette color mappings
  "tailwind.config",
  "scripts/",
  ".agents/",
  "node_modules/",
  "src/components/DebugScreen.tsx", // Dev-only, excluded from token enforcement
  "src/components/AudioTestScreen.tsx", // Dev-only, excluded from token enforcement
];

// Patterns that indicate hardcoded colors (NOT semantic tokens)
const FORBIDDEN_PATTERNS = [
  // Raw Tailwind palette classes (specifically numbered ones like slate-600, not white/black)
  {
    pattern:
      /\b(bg|text|border|ring|fill|stroke|shadow|outline|decoration)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})\b/,
    description: "Raw Tailwind palette class",
  },
  // bg-gradient-to-* directives
  {
    pattern: /\bbg-gradient-to-(t|tr|r|br|b|bl|l|tl)\b/,
    description: "bg-gradient-to-* directive — use semantic gradient token",
  },
  // from-* and to-* Tailwind gradient stops with palette colors
  {
    pattern:
      /\b(from|via|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})\b/,
    description: "Tailwind gradient stop with palette color",
  },
  // Hex literals in className or style
  {
    pattern: /(?:className|class)=["'][^"']*#[0-9a-fA-F]{3,8}[^"']*["']/,
    description: "Hex color literal in className",
  },
  { pattern: /\[#[0-9a-fA-F]{3,8}\]/, description: "Arbitrary hex value in Tailwind class" },
  // rgb()/hsl() in className
  {
    pattern: /\[(?:rgb|hsl)a?\(/,
    description: "rgb()/hsl() color literal in Tailwind arbitrary class",
  },
  // Inline style with color properties using hex/rgb/hsl
  {
    pattern: /style=[{][^}]*(?:color|background|border-color)\s*:\s*["'](?:#|rgb|hsl)/,
    description: "Inline style with hardcoded color",
  },
  // Canvas fillStyle/strokeStyle with string literals (not variables)
  {
    pattern: /(?:fillStyle|strokeStyle)\s*=\s*["'](?!var\()(?!url\()[^"']+["']/,
    description: "Canvas fillStyle/strokeStyle with hardcoded color",
  },
  // shadow-green-* shadow-red-* etc (colored shadows with palette colors)
  {
    pattern:
      /shadow-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/,
    description: "Colored shadow with palette class",
  },
];

function isAllowlisted(filePath) {
  const rel = relative(WORKSPACE, filePath).replace(/\\\\/g, "/");
  return ALLOWLIST.some((allowed) => rel.includes(allowed));
}

function getAllFiles(dir) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".git", "dist", "build", ".agents"].includes(entry.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

let violations = [];
let fileViolationCounts = {};

const files = getAllFiles(SRC_DIR);

for (const file of files) {
  if (isAllowlisted(file)) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  let fileHasViolations = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { pattern, description } of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        const relPath = relative(WORKSPACE, file).replace(/\\/g, "/");
        violations.push({ file: relPath, line: i + 1, content: line.trim(), description });
        fileHasViolations = true;
        const key = relPath;
        fileViolationCounts[key] = (fileViolationCounts[key] || 0) + 1;
        break; // one violation per line is enough
      }
    }
  }
}

// Load baseline if it exists
let baseline = {};
if (existsSync(BASELINE_FILE)) {
  baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
}

// Check against baseline
let newViolations = [];
for (const [file, count] of Object.entries(fileViolationCounts)) {
  const baselineCount = baseline[file] || 0;
  if (count > baselineCount) {
    newViolations.push({ file, count, baselineCount, increase: count - baselineCount });
  }
}

if (newViolations.length > 0) {
  console.error("\n❌ Theme token violations detected (exceeds baseline):\n");
  for (const v of newViolations) {
    console.error(
      `  ${v.file}: ${v.count} violations (baseline: ${v.baselineCount}, +${v.increase})`,
    );
  }
  // Show first 10 actual violations for context
  const toShow = violations
    .filter((v) => newViolations.some((nv) => nv.file === v.file))
    .slice(0, 10);
  if (toShow.length > 0) {
    console.error("\nFirst violations:");
    for (const v of toShow) {
      console.error(`  ${v.file}:${v.line} [${v.description}]`);
      console.error(`    ${v.content}`);
    }
  }
  console.error("\nFix violations or update scripts/theme-token-baseline.json if intentional.");
  process.exit(1);
} else {
  const total = Object.values(fileViolationCounts).reduce((a, b) => a + b, 0);
  if (total > 0) {
    console.log(`✅ Theme check passed (${total} known baseline violations, no regressions)`);
  } else {
    console.log("✅ Theme check passed — zero hardcoded color violations!");
  }
  process.exit(0);
}
