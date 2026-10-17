#!/usr/bin/env node
/**
 * Resolves the design tokens of every theme (tokens.css + src/styles/themes/*.css) and checks
 * the foreground/background pairs the components rely on. Fails (exit 1) if a pair is below
 * its minimum contrast ratio, or if a theme leaves a semantic colour token undefined.
 *
 * Usage: node scripts/check-theme-contrast.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';

const VERBOSE = process.argv.includes('--verbose');
const TOKENS = 'src/styles/tokens.css';
const THEME_DIR = 'src/styles/themes';

// ---------- CSS token parsing ----------
function parseBlocks(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const props = new Map();
    for (const d of m[2].matchAll(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g)) props.set(d[1], d[2].trim());
    if (props.size) blocks.push({ selector: m[1].trim(), props });
  }
  return blocks;
}

const defaultProps = new Map();
for (const b of parseBlocks(TOKENS)) {
  if (b.selector === ':root' || /^:root\s*,\s*\[data-theme=["']clay["']\]$/.test(b.selector)) {
    for (const [k, v] of b.props) defaultProps.set(k, v);
  }
}

const imported = new Set(
  [...fs.readFileSync('src/styles.css', 'utf8').matchAll(/@import\s+["']\.\/styles\/themes\/([^"']+\.css)["']/g)].map((m) => m[1]),
);
const themes = [{ id: 'clay', props: new Map(defaultProps), own: new Set(defaultProps.keys()) }];
for (const f of fs.readdirSync(THEME_DIR).filter((n) => n.endsWith('.css') && imported.has(n))) {
  const props = new Map(defaultProps);
  const own = new Set();
  let id = f.replace('.css', '');
  for (const b of parseBlocks(path.join(THEME_DIR, f))) {
    const sel = b.selector.match(/\[data-theme=["']([^"']+)["']\]/);
    if (sel) id = sel[1];
    for (const [k, v] of b.props) {
      props.set(k, v);
      own.add(k);
    }
  }
  if (id === 'clay') {
    for (const [k, v] of props) themes[0].props.set(k, v);
    for (const k of own) themes[0].own.add(k);
  } else themes.push({ id, props, own, file: f });
}

function resolve(value, props, depth = 0) {
  if (depth > 12) return value;
  return value.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name, fallback) => {
    const v = props.get(name);
    return v !== undefined ? resolve(v, props, depth + 1) : (fallback ?? 'UNDEFINED');
  });
}

// ---------- colour maths ----------
const clamp = (x) => Math.min(1, Math.max(0, x));
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** returns [r,g,b] linear and alpha, or null */
function parseColor(str) {
  str = str.trim();
  let m = str.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { rgb: [srgbToLinear(n(0)), srgbToLinear(n(2)), srgbToLinear(n(4))], a: h.length === 8 ? n(6) : 1 };
  }
  m = str.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (m) {
    let a = 1;
    if (m[4]) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [srgbToLinear(m[1] / 255), srgbToLinear(m[2] / 255), srgbToLinear(m[3] / 255)], a };
  }
  m = str.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  if (m) {
    const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    let a = 1;
    if (m[4]) a = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: oklchToLinear(L, parseFloat(m[2]), parseFloat(m[3])), a };
  }
  return null;
}

/** all colour stops inside a value (single colour or gradient) */
function colourStops(value, base = [1, 1, 1]) {
  const out = [];
  const re = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|oklch\([^)]*\)/gi;
  for (const m of value.matchAll(re)) {
    const c = parseColor(m[0]);
    if (c && c.a > 0.02) {
      if (c.a < 1) c.rgb = c.rgb.map((v, i) => v * c.a + base[i] * (1 - c.a));
      out.push(c);
    }
  }
  return out;
}

const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function ratio(a, b) {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// ---------- checks ----------
// [foreground token, background token, minimum ratio, note]
const PAIRS = [
  ['--text-primary', '--surface-card', 4.5],
  ['--text-primary', '--surface-raised', 4.5],
  ['--text-primary', '--surface-sunken', 4.5],
  ['--text-primary', '--bg-page', 4.5],
  ['--text-on-header', '--bg-header', 4.5],
  ['--text-primary', '--bg-nav', 4.5],
  ['--text-secondary', '--surface-card', 4.5],
  ['--text-secondary', '--bg-page', 4.5],
  ['--text-muted', '--surface-card', 4.5],
  ['--text-link', '--surface-card', 4.5],
  ['--action-primary-fg', '--action-primary-bg', 4.5],
  ['--text-on-primary', '--action-primary-bg', 4.5],
  ['--action-secondary-fg', '--action-secondary-bg', 4.5],
  ['--action-success-fg', '--action-success-bg', 4.5],
  ['--accent-1-ink', '--accent-1', 4.5], ['--accent-2-ink', '--accent-2', 4.5], ['--accent-3-ink', '--accent-3', 4.5],
  ['--accent-4-ink', '--accent-4', 4.5], ['--accent-5-ink', '--accent-5', 4.5],
  ['--text-primary', '--accent-1-soft', 4.5], ['--text-primary', '--accent-2-soft', 4.5],
  ['--text-primary', '--accent-3-soft', 4.5], ['--text-primary', '--accent-4-soft', 4.5],
  ['--text-primary', '--accent-5-soft', 4.5],
  ['--fb-success-fg', '--fb-success-bg', 4.5], ['--fb-warning-fg', '--fb-warning-bg', 4.5],
  ['--fb-error-fg', '--fb-error-bg', 4.5], ['--fb-info-fg', '--fb-info-bg', 4.5],
];
// colour tokens every theme must define (dark themes must define ALL of the "surface" group themselves)
const REQUIRED_DEFINED = [
  '--bg-page', '--bg-header', '--bg-nav', '--surface-card', '--surface-raised', '--surface-sunken',
  '--text-primary', '--text-secondary', '--text-muted', '--text-on-header', '--text-link',
  '--action-primary-bg', '--action-primary-fg', '--action-secondary-bg', '--action-secondary-fg',
  '--action-success-bg', '--action-success-fg',
  '--fb-success-bg', '--fb-success-fg', '--fb-success-border', '--fb-warning-bg', '--fb-warning-fg',
  '--fb-warning-border', '--fb-error-bg', '--fb-error-fg', '--fb-error-border', '--fb-info-bg',
  '--fb-info-fg', '--fb-info-border',
];
for (let i = 1; i <= 5; i++) REQUIRED_DEFINED.push(`--accent-${i}`, `--accent-${i}-soft`, `--accent-${i}-ink`);

let failures = 0;
for (const t of themes) {
  const isDark = resolve(t.props.get('--is-dark') ?? '0', t.props).trim() === '1';
  const lines = [];
  for (const k of REQUIRED_DEFINED) {
    if (!t.props.has(k)) lines.push(`  MISSING  ${k} is not defined`);
    else if (isDark && t.id !== 'clay' && !t.own.has(k) && !/^--accent-\d$/.test(k)) {
      lines.push(`  INHERITS ${k} comes from the LIGHT default (dark theme must define it)`);
    }
  }
  for (const [fg, bg, min, note] of PAIRS) {
    const fv = t.props.get(fg), bv = t.props.get(bg);
    if (fv === undefined || bv === undefined) continue;
    const pageStops = colourStops(resolve(t.props.get('--bg-page') ?? '#fff', t.props)).filter(() => true);
    const base = (pageStops.find((c) => c.a === 1) ?? pageStops[pageStops.length - 1] ?? { rgb: [1, 1, 1] }).rgb;
    const f = colourStops(resolve(fv, t.props), base)[0];
    const bgs = colourStops(resolve(bv, t.props), base);
    if (!f || bgs.length === 0) { lines.push(`  UNPARSED ${fg} on ${bg}`); continue; }
    const worst = Math.min(...bgs.map((b) => ratio(f.rgb, b.rgb)));
    if (worst < min) {
      const cands = [['dark ink oklch(0.22 0.05 260)', parseColor('oklch(0.22 0.05 260)')], ['white oklch(1 0 0)', parseColor('oklch(1 0 0)')]];
      const ok = cands.find(([, c]) => Math.min(...bgs.map((b) => ratio(c.rgb, b.rgb))) >= min);
      lines.push(`  LOW      ${fg} on ${bg}: ${worst.toFixed(2)}:1 (need ${min}:1)${ok ? '  -> use ' + ok[0] : '  -> change the background colour'}${note ? ' - ' + note : ''}`);
    }
    else if (VERBOSE) lines.push(`  ok       ${fg} on ${bg}: ${worst.toFixed(1)}:1`);
  }
  const bad = lines.filter((l) => !l.startsWith('  ok')).length;
  failures += bad;
  console.log(`${bad === 0 ? 'PASS' : 'FAIL'}  ${t.id}${isDark ? ' (dark)' : ''}${bad ? '  - ' + bad + ' problem(s)' : ''}`);
  for (const l of lines) console.log(l);
}
console.log(failures === 0 ? '\nAll themes pass.' : `\n${failures} problem(s) found.`);
process.exit(failures === 0 ? 0 : 1);
