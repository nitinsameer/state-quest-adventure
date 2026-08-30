import fs from 'fs';
import path from 'path';

// Read the prerendered shell
const shellPath = 'dist/client/_shell.html';
const indexPath = 'dist/client/index.html';

let shell = fs.readFileSync(shellPath, 'utf-8');

// CRITICAL: Remove async attribute from embedded router manifest script
// TanStack Start embeds async:!0 in the manifest which breaks hydration
// Pattern: async:!0 should be removed from the router manifest script
shell = shell.replace(/async:!0,/g, '');
shell = shell.replace(/async:true,/g, '');

// Find the CSS file
const cssFiles = fs.readdirSync('dist/client/assets').filter(f => f.startsWith('styles-') && f.endsWith('.css'));
const cssFile = cssFiles[0] || 'styles.css';

// Find the main JS file
const jsFiles = fs.readdirSync('dist/client/assets').filter(f => f.startsWith('index-') && f.endsWith('.js'));
const jsFile = jsFiles[0] || 'index.js';

// Wrap in complete HTML document
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>India Explorer — Travel Across India, One State at a Time</title>
  <meta name="description" content="A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." />
  <meta name="author" content="India Explorer" />
  <meta property="og:title" content="India Explorer — Travel Across India, One State at a Time" />
  <meta property="og:description" content="A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="India Explorer — Travel Across India, One State at a Time" />
  <meta name="twitter:description" content="A kids adventure app that teaches Indian states through exploration, quizzes, passport stamps and badges." />
  <link rel="stylesheet" href="./assets/${cssFile}" />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #fff; }
  </style>
</head>
<body>
${shell}
  <script type="module" src="./assets/${jsFile}"></script>
</body>
</html>`;

fs.writeFileSync(indexPath, html, 'utf-8');
console.log(`✓ Wrapped shell HTML: ${indexPath}`);
console.log(`  CSS: ${cssFile}`);
console.log(`  JS:  ${jsFile}`);
console.log(`  Note: Removed async attribute from embedded router manifest for proper hydration`);
