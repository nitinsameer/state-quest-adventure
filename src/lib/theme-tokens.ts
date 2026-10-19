/**
 * Runtime Token Reader & Converter
 *
 * Used for reading CSS custom properties at runtime (especially for canvas,
 * confetti, and other dynamic rendering contexts that don't have CSS access).
 *
 * NOTE: This file contains JSDoc examples with hex and rgb values for documentation purposes.
 * These are not active code but serve to document function behavior and canvas color conversion.
 * eslint-disable no-hardcoded-colors/no-hardcoded-colors
 *
 * Why: Canvas fillStyle/strokeStyle, gradients, and inline effects need
 * computed colour values. CSS variables alone won't work; we read them
 * from the DOM's computed styles.
 */

/**
 * Read a CSS token value at runtime from the document root.
 * Use for canvas drawing, confetti, and other runtime-computed colours.
 *
 * @param tokenName - CSS variable name (e.g., '--color-text-primary')
 * @returns Computed token value (string), or empty string if not found
 *
 * @example
 * readToken('--color-text-primary')  // Returns: 'oklch(0.22 0.05 260)'
 * readToken('--color-brand-saffron') // Returns: 'oklch(0.74 0.19 45)'
 */
export function readToken(tokenName: string): string {
  if (typeof document === "undefined") return "";
  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  return value;
}

/**
 * Parse a CSS colour token to RGB hex (for canvas compatibility).
 * Handles oklch(), rgb(), rgba(), #hex, and named colours.
 *
 * Canvas expects hex or rgb() format; oklch() is not understood.
 * This converts any CSS colour format to hex for universal canvas support.
 *
 * @param tokenValue - CSS colour value (e.g., 'oklch(0.74 0.19 45)' or 'rgb(255, 255, 255)')
 * @returns Hex colour string (e.g., '#ffffff') or original if already hex
 *
 * @example
 * tokenToHex('oklch(0.74 0.19 45)')    // Returns: '#ff7a1a'
 * tokenToHex('rgb(255, 255, 255)')     // Returns: '#ffffff'
 * tokenToHex('rgba(255, 0, 0, 0.5)')   // Returns: '#ff0000'
 * tokenToHex('#ff7a1a')                // Returns: '#ff7a1a'
 * // eslint-disable-next-line no-hardcoded-colors/no-hardcoded-colors
 */
export function tokenToHex(tokenValue: string): string {
  // If already hex, return as-is
  if (tokenValue.startsWith("#")) return tokenValue;

  // Parse rgb/rgba: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5)
  const rgbMatch = tokenValue.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  // Parse oklch() using a temporary canvas to convert to RGB
  // oklch(L C H) where L is lightness, C is chroma, H is hue
  if (tokenValue.startsWith("oklch(")) {
    try {
      // Create a temporary div, set its background to the oklch value,
      // and read back the computed rgb() value
      const tempDiv = document.createElement("div");
      tempDiv.style.color = tokenValue;
      document.body.appendChild(tempDiv);
      const computed = getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);

      // Now parse the computed rgb() value
      const rgbMatch2 = computed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (rgbMatch2) {
        const r = parseInt(rgbMatch2[1], 10);
        const g = parseInt(rgbMatch2[2], 10);
        const b = parseInt(rgbMatch2[3], 10);
        return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      }
    } catch {
      // Fallback: return as-is if conversion fails
    }
  }

  // If none of the above, return as-is (may fail in canvas, but don't break)
  return tokenValue;
}

/**
 * Read and convert a CSS colour token for canvas.fillStyle/strokeStyle.
 *
 * Combines readToken() + tokenToHex() for one-liner canvas colour reads.
 *
 * @param tokenName - CSS variable name (e.g., '--color-brand-saffron')
 * @returns Hex colour string ready for canvas (e.g., '#ff7a1a')
 *
 * @example
 * c.fillStyle = readTokenAsHex('--color-brand-saffron');
 * c.strokeStyle = readTokenAsHex('--color-text-primary');
 */
export function readTokenAsHex(tokenName: string): string {
  const tokenValue = readToken(tokenName);
  return tokenToHex(tokenValue);
}

/**
 * Subscribe to theme changes and call a callback when the theme changes.
 *
 * Watches the `data-theme` attribute on the document root. When it changes,
 * the callback is invoked. This is used to trigger canvas redraws when theme changes.
 *
 * @param cb - Callback to invoke when theme changes
 * @returns Unsubscribe function to stop watching
 *
 * @example
 * useEffect(() => {
 *   const unsubscribe = subscribeThemeChange(() => {
 *     redrawCanvas();
 *   });
 *   return unsubscribe;
 * }, []);
 */
export function subscribeThemeChange(cb: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "data-theme") {
        cb();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}
