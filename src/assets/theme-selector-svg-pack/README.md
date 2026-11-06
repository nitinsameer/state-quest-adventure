# Theme selector SVG pack

Eight lightweight decorative SVG backgrounds for Bubblegum Pop, Comic Book, Rainbow Box, Electro Dream, Leather Luxury, Cold Simple, Notebook Paper and Warm Clay.

## Integration
These SVGs use semantic CSS variables:
- `--theme-preview-bg`
- `--theme-preview-accent`
- `--theme-preview-accent-2`
- `--theme-preview-ink`
- `--theme-preview-line`

Render them inline (e.g. as React SVG components), not as ordinary external `<img>` elements, so the app's CSS custom properties can inherit into the SVG. Map these semantic variables to the existing theme tokens in one place in the preview-card wrapper. Do not duplicate theme color definitions.

These are decorative backgrounds only. Keep the existing ThemeCard dots, Aa sample, Play button, theme name, selection indicator and selection behaviour. All files use a 600x260 viewBox and contain no raster images, fonts, scripts or external dependencies.
