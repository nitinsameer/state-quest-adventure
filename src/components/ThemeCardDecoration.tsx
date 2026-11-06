/**
 * ThemeCardDecoration Component
 *
 * Renders theme-specific decorative graphics in the theme picker card preview.
 * Each theme has a unique visual personality using only CSS shapes, gradients, and transforms.
 * No external images, SVG assets, or additional packages.
 *
 * Colors derive exclusively from theme.previewTokens for token-based consistency.
 */

import { type Theme } from "@/lib/themes";

interface ThemeCardDecorationProps {
  themeId: string;
  theme: Theme;
}

/**
 * Clay (Warm Clay): Soft overlapping circles with organic gradient
 */
function ClayDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Background blur gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${theme.previewTokens.accent}15 0%, transparent 60%)`,
        }}
      />
      {/* Large organic circle 1 */}
      <div
        className="absolute rounded-full"
        style={{
          width: "60px",
          height: "60px",
          background: `radial-gradient(circle at 35% 35%, ${theme.previewTokens.accent}40, ${theme.previewTokens.accent}10)`,
          top: "-10px",
          left: "-15px",
          filter: "blur(8px)",
        }}
      />
      {/* Large organic circle 2 */}
      <div
        className="absolute rounded-full"
        style={{
          width: "50px",
          height: "50px",
          background: `radial-gradient(circle at 40% 40%, ${theme.previewTokens.accent}35, ${theme.previewTokens.accent}5)`,
          bottom: "-5px",
          right: "-10px",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

/**
 * Pop (Bubblegum Pop): Semi-transparent bubbles with radial gradients
 */
function PopDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Bubble 1 - Large */}
      <div
        className="absolute rounded-full"
        style={{
          width: "45px",
          height: "45px",
          background: `radial-gradient(circle at 35% 35%, ${theme.previewTokens.accent}60, ${theme.previewTokens.accent}20)`,
          top: "8px",
          left: "10px",
          border: `2px solid ${theme.previewTokens.accent}40`,
          boxShadow: `inset -2px -2px 4px ${theme.previewTokens.accent}20`,
        }}
      />
      {/* Bubble 2 - Medium */}
      <div
        className="absolute rounded-full"
        style={{
          width: "32px",
          height: "32px",
          background: `radial-gradient(circle at 40% 40%, ${theme.previewTokens.accent}50, ${theme.previewTokens.accent}15)`,
          bottom: "12px",
          right: "12px",
          border: `1.5px solid ${theme.previewTokens.accent}30`,
          boxShadow: `inset -1px -1px 3px ${theme.previewTokens.accent}15`,
        }}
      />
      {/* Bubble 3 - Small */}
      <div
        className="absolute rounded-full"
        style={{
          width: "20px",
          height: "20px",
          background: `radial-gradient(circle at 35% 35%, ${theme.previewTokens.accent}40, ${theme.previewTokens.accent}10)`,
          top: "50%",
          right: "8px",
          border: `1px solid ${theme.previewTokens.accent}25`,
        }}
      />
    </div>
  );
}

/**
 * Cartoon (Comic Book): Speed lines and comic burst shape
 */
function CartoonDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Speed lines - diagonal 45° */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={`speed-${i}`}
          className="absolute"
          style={{
            width: "50px",
            height: "3px",
            background: theme.previewTokens.accent,
            transform: `rotate(45deg) translateX(${i * 8}px)`,
            top: "50%",
            left: "10%",
            opacity: 0.6 - i * 0.1,
          }}
        />
      ))}
      {/* Comic burst star shape (8-pointed) */}
      <div
        className="absolute"
        style={{
          width: "36px",
          height: "36px",
          top: "50%",
          right: "15%",
          transform: "translate(0, -50%)",
        }}
      >
        {/* Star burst using borders */}
        <div
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderBottom: `24px solid ${theme.previewTokens.accent}`,
            top: "-12px",
            left: "-18px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderTop: `24px solid ${theme.previewTokens.accent}`,
            bottom: "-12px",
            left: "-18px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "24px",
            height: "24px",
            border: `2px solid black`,
            borderRadius: "2px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: theme.previewTokens.bg,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Bento (Rainbow Box): Minimal 2×2 grid of colored squares
 */
function BentoDecoration({ theme }: { theme: Theme }) {
  // Extract accent color and create complementary colors for the grid
  const colors = [
    theme.previewTokens.accent, // Orange/primary
    "#22c55e", // Lime green
    "#06b6d4", // Cyan
    "#ef4444", // Red
  ];

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        gap: "4px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        padding: "12px",
      }}
    >
      {colors.map((color, i) => (
        <div
          key={`box-${i}`}
          style={{
            backgroundColor: color,
            borderRadius: "4px",
            aspectRatio: "1",
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Minimal (Cold Simple): 3-4 dots in subtle gradient
 */
function MinimalDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${theme.previewTokens.accent}05 0%, transparent 100%)`,
        }}
      />
      {/* Dot 1 */}
      <div
        className="absolute rounded-full"
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: theme.previewTokens.accent,
          top: "25%",
          left: "20%",
          opacity: 0.6,
        }}
      />
      {/* Dot 2 */}
      <div
        className="absolute rounded-full"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: theme.previewTokens.accent,
          top: "60%",
          left: "35%",
          opacity: 0.4,
        }}
      />
      {/* Dot 3 */}
      <div
        className="absolute rounded-full"
        style={{
          width: "7px",
          height: "7px",
          backgroundColor: theme.previewTokens.accent,
          bottom: "20%",
          right: "25%",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

/**
 * Paper (Notebook Paper): Handwritten-style checkmark and doodle
 */
function PaperDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Handwritten checkmark (SVG-like using CSS) */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-5deg)",
          opacity: 0.7,
        }}
      >
        <path
          d="M 8 20 L 16 28 L 32 12"
          stroke={theme.previewTokens.accent}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Small doodle circles */}
      {[0, 1, 2].map((i) => (
        <div
          key={`doodle-${i}`}
          className="absolute rounded-full border-2"
          style={{
            width: `${12 + i * 4}px`,
            height: `${12 + i * 4}px`,
            borderColor: theme.previewTokens.accent,
            opacity: 0.3,
            top: `${15 + i * 15}%`,
            right: `${10 + i * 12}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Synth (Electro Dream): Neon wireframe and glow effects
 */
function SynthDecoration({ theme }: { theme: Theme }) {
  // Primary accent (cyan typically) for neon effect
  const neonColor = theme.previewTokens.accent;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Wireframe diagonal lines */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`wire-${i}`}
          className="absolute"
          style={{
            width: "2px",
            height: "40px",
            background: `linear-gradient(90deg, transparent, ${neonColor}, transparent)`,
            transform: `rotate(-45deg) translateX(${i * 6 - 9}px)`,
            top: "50%",
            left: "50%",
            boxShadow: `0 0 8px ${neonColor}, 0 0 16px ${neonColor}66`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Glowing circles */}
      <div
        className="absolute rounded-full"
        style={{
          width: "24px",
          height: "24px",
          border: `1px solid ${neonColor}`,
          boxShadow: `0 0 8px ${neonColor}, inset 0 0 8px ${neonColor}44`,
          top: "25%",
          left: "25%",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "16px",
          height: "16px",
          border: `1px solid ${neonColor}`,
          boxShadow: `0 0 6px ${neonColor}`,
          bottom: "20%",
          right: "20%",
        }}
      />
    </div>
  );
}

/**
 * Skeuo (Leather Luxury): Embossed circles with metallic accents
 */
function SkeuoDecoration({ theme }: { theme: Theme }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Embossed circle 1 - larger */}
      <div
        className="absolute rounded-full"
        style={{
          width: "50px",
          height: "50px",
          background: `radial-gradient(circle at 30% 30%, ${theme.previewTokens.accent}30, ${theme.previewTokens.accent}10)`,
          boxShadow: `
            inset 2px 2px 4px rgba(0, 0, 0, 0.2),
            inset -2px -2px 4px rgba(255, 255, 255, 0.3),
            0 4px 8px rgba(0, 0, 0, 0.1)
          `,
          top: "15%",
          left: "15%",
        }}
      />

      {/* Embossed circle 2 - medium */}
      <div
        className="absolute rounded-full"
        style={{
          width: "36px",
          height: "36px",
          background: `radial-gradient(circle at 35% 35%, ${theme.previewTokens.accent}25, ${theme.previewTokens.accent}5)`,
          boxShadow: `
            inset 1.5px 1.5px 3px rgba(0, 0, 0, 0.15),
            inset -1.5px -1.5px 3px rgba(255, 255, 255, 0.25),
            0 3px 6px rgba(0, 0, 0, 0.08)
          `,
          bottom: "18%",
          right: "18%",
        }}
      />

      {/* Metallic accent line */}
      <div
        className="absolute"
        style={{
          width: "30px",
          height: "2px",
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(0.5px)",
        }}
      />
    </div>
  );
}

/**
 * Main decoration renderer: dispatches to theme-specific sub-component
 */
export function ThemeCardDecoration({ themeId, theme }: ThemeCardDecorationProps) {
  // Dispatch to theme-specific decoration renderer
  switch (themeId) {
    case "clay":
      return <ClayDecoration theme={theme} />;
    case "pop":
      return <PopDecoration theme={theme} />;
    case "cartoon":
      return <CartoonDecoration theme={theme} />;
    case "bento":
      return <BentoDecoration theme={theme} />;
    case "minimal":
      return <MinimalDecoration theme={theme} />;
    case "paper":
      return <PaperDecoration theme={theme} />;
    case "synth":
      return <SynthDecoration theme={theme} />;
    case "skeuo":
      return <SkeuoDecoration theme={theme} />;
    default:
      // Fallback: empty decoration for unknown themes
      return null;
  }
}
