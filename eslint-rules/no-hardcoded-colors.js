/**
 * ESLint rule to prevent hardcoded color values in inline styles
 * Colors should use CSS token variables (var(--token-name)) from src/styles/tokens.css
 */

// Common color patterns that should use CSS tokens
const COLOR_PATTERNS = {
  oklch: /oklch(?:a)?\s*\(\s*[\d.]+\s+[\d.]+\s+[\d.]+(?:\s+[\d.]+)?\s*\)/g,
  hex: /#([0-9a-fA-F]{3}){1,2}\b/g,
  rgb: /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/g,
  hsl: /hsla?\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)/g,
};

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent hardcoded color values in inline styles. Use CSS token variables (var(--token-name)) from src/styles/tokens.css instead.",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      hardcodedColor:
        "Hardcoded color found: '{{ color }}'. Use CSS token variables instead. Example: var(--color-primary) or var(--color-surface-primary). See src/styles/tokens.css for available tokens.",
    },
  },

  create(context) {
    // Helper to check if a value contains color patterns
    const hasColorPattern = (value) => {
      if (!value || typeof value !== "string") return null;

      for (const [type, pattern] of Object.entries(COLOR_PATTERNS)) {
        const match = value.match(pattern);
        if (match) return match[0];
      }
      return null;
    };

    return {
      // Check inline style objects: style={{ backgroundColor: "#fff" }}
      ObjectExpression(node) {
        const parent = node.parent;

        // Check if this is a style prop
        if (
          parent.type === "JSXAttribute" &&
          parent.name &&
          (parent.name.name === "style" || parent.name.type === "JSXIdentifier")
        ) {
          node.properties.forEach((prop) => {
            if (prop.type === "Property") {
              const keyName = prop.key.name || String(prop.key.value);

              // Check if this property is color-related
              const isColorProperty = [
                "color",
                "backgroundColor",
                "borderColor",
                "outlineColor",
                "fill",
                "stroke",
              ].some((c) => keyName === c);

              if (
                isColorProperty &&
                prop.value.type === "Literal" &&
                typeof prop.value.value === "string"
              ) {
                const colorMatch = hasColorPattern(prop.value.value);
                if (colorMatch) {
                  context.report({
                    node: prop.value,
                    messageId: "hardcodedColor",
                    data: {
                      color: colorMatch,
                    },
                  });
                }
              }
            }
          });
        }
      },

      // Check className strings for hardcoded color values (inline style in class)
      JSXAttribute(node) {
        if (node.name.name === "style" && node.value && node.value.type === "Literal") {
          const styleStr = node.value.value;
          if (typeof styleStr === "string") {
            const colorMatch = hasColorPattern(styleStr);
            if (colorMatch) {
              context.report({
                node: node.value,
                messageId: "hardcodedColor",
                data: {
                  color: colorMatch,
                },
              });
            }
          }
        }
      },
    };
  },
};
