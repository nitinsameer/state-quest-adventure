/**
 * ESLint rule to prevent hardcoded emoji literals in JSX
 * Emoji should be imported from src/constants/emoji.ts instead
 * This rule specifically targets common emoji in icon/label contexts
 */

// Common emoji that should be in constants instead of hardcoded
const COMMON_HARDCODED_EMOJI = {
  "🏠": "EMOJI.nav.home",
  "🗺️": "EMOJI.nav.explorer",
  "📍": "EMOJI.nav.journey",
  "🎯": "EMOJI.achievement",
  "⭐": "EMOJI.star",
  "🏆": "EMOJI.trophy",
  "🎉": "EMOJI.celebration",
  "✨": "EMOJI.sparkle",
  "🌟": "EMOJI.sparkle",
  "💫": "EMOJI.sparkle",
  "🎊": "EMOJI.celebration",
  "🎈": "EMOJI.balloon",
  "🎁": "EMOJI.gift",
  "❤️": "EMOJI.heart",
  "💚": "EMOJI.heart",
  "💙": "EMOJI.heart",
  "👶": "EMOJI.ageBand.baby",
  "🧒": "EMOJI.ageBand.toddler",
  "👧": "EMOJI.ageBand.child",
  "👦": "EMOJI.ageBand.child",
  "🧑": "EMOJI.ageBand.teen",
  "👨": "EMOJI.ageBand.adult",
  "👩": "EMOJI.ageBand.adult",
  "🌍": "EMOJI.world",
  "🌏": "EMOJI.world",
  "🌎": "EMOJI.world",
  "🗺": "EMOJI.map",
  "📺": "EMOJI.screen",
  "📱": "EMOJI.phone",
  "💻": "EMOJI.computer",
  "⚙️": "EMOJI.settings",
  "🔧": "EMOJI.settings",
  "🎮": "EMOJI.game",
  "🏅": "EMOJI.medal",
  "🥇": "EMOJI.medal",
  "🥈": "EMOJI.medal",
  "🥉": "EMOJI.medal",
};

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent hardcoded emoji literals in JSX. Use EMOJI constants from src/constants/emoji.ts instead.",
      category: "Best Practices",
      recommended: true,
    },
    fixable: false,
    messages: {
      hardcodedEmoji:
        "Hardcoded emoji found: '{{ emoji }}'. Use EMOJI constants from 'src/constants/emoji.ts' instead. Example: {{ suggestion }}",
      unknownEmoji:
        "Hardcoded emoji found: '{{ emoji }}'. Add it to EMOJI constants in 'src/constants/emoji.ts' and use the constant in JSX instead of the literal emoji.",
    },
  },

  create(context) {
    return {
      // Check string literals in JSX attributes and object properties (the main use case)
      Literal(node) {
        // Skip if not a string
        if (typeof node.value !== "string") {
          return;
        }

        const parent = node.parent;

        // Only check in JSX attribute values and object properties (not text content or other strings)
        const isRelevantContext =
          parent.type === "JSXAttribute" ||
          (parent.type === "Property" &&
            (parent.key.name === "icon" || parent.key.name === "emoji"));

        if (!isRelevantContext) {
          return;
        }

        // Check if any known hardcoded emoji are in the string
        for (const [emoji, suggestion] of Object.entries(COMMON_HARDCODED_EMOJI)) {
          if (node.value.includes(emoji)) {
            context.report({
              node,
              messageId: "hardcodedEmoji",
              data: {
                emoji,
                suggestion,
              },
            });
            return;
          }
        }
      },

      // Check object expressions for icon properties
      ObjectExpression(node) {
        node.properties.forEach((prop) => {
          if (prop.type === "Property" && (prop.key.name === "icon" || prop.key.name === "emoji")) {
            if (prop.value.type === "Literal" && typeof prop.value.value === "string") {
              const value = prop.value.value;

              // Check for known emoji
              for (const [emoji, suggestion] of Object.entries(COMMON_HARDCODED_EMOJI)) {
                if (value.includes(emoji)) {
                  context.report({
                    node: prop.value,
                    messageId: "hardcodedEmoji",
                    data: {
                      emoji,
                      suggestion,
                    },
                  });
                  return;
                }
              }
            }
          }
        });
      },
    };
  },
};
