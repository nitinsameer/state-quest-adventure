/**
 * Age Band Illustration Components
 *
 * Lightweight SVG illustrations for growth-themed age bands.
 * Uses CSS custom properties for theme-aware colors that respond to light/dark themes.
 */

export interface IllustrationProps {
  size?: number;
  className?: string;
}

/**
 * Sprout Illustration (Ages 3-5)
 * A small green shoot emerging from brown soil
 */
export function SproutIllustration({ size = 48, className = "" }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ display: "block" }}
    >
      {/* Soil */}
      <ellipse cx="24" cy="36" rx="14" ry="6" fill="var(--accent-4, #8b7355)" opacity="0.8" />
      <rect x="10" y="32" width="28" height="8" fill="var(--accent-4, #8b7355)" />

      {/* Sprout stem */}
      <path
        d="M 24 32 Q 22 28 23 24 Q 24 20 25 16"
        stroke="var(--success, #4ade80)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sprout leaves - left */}
      <ellipse cx="18" cy="20" rx="3" ry="6" fill="var(--success, #4ade80)" opacity="0.9" transform="rotate(-35 18 20)" />

      {/* Sprout leaves - right */}
      <ellipse cx="30" cy="22" rx="3" ry="6" fill="var(--success, #4ade80)" opacity="0.85" transform="rotate(35 30 22)" />

      {/* Highlight on stem */}
      <path
        d="M 24.5 30 Q 24.8 26 25.2 22"
        stroke="var(--accent-1, #4ade80)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Seedling Illustration (Ages 6-7)
 * A young plant with 2-3 green leaves
 */
export function SeedlingIllustration({ size = 48, className = "" }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ display: "block" }}
    >
      {/* Soil */}
      <ellipse cx="24" cy="38" rx="16" ry="6" fill="var(--accent-4, #8b7355)" opacity="0.8" />
      <rect x="8" y="34" width="32" height="8" fill="var(--accent-4, #8b7355)" />

      {/* Main stem */}
      <path
        d="M 24 34 Q 22 28 22 22 Q 22 16 24 10"
        stroke="var(--success, #4ade80)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left leaf - lower */}
      <ellipse cx="12" cy="24" rx="5" ry="8" fill="var(--success, #4ade80)" opacity="0.85" transform="rotate(-45 12 24)" />

      {/* Left leaf - upper */}
      <ellipse cx="10" cy="14" rx="5" ry="8" fill="var(--success, #4ade80)" opacity="0.9" transform="rotate(-50 10 14)" />

      {/* Right leaf */}
      <ellipse cx="36" cy="20" rx="5" ry="8" fill="var(--success, #4ade80)" opacity="0.8" transform="rotate(45 36 20)" />

      {/* Leaf veins - left lower */}
      <line x1="12" y1="18" x2="12" y2="30" stroke="var(--accent-1, #4ade80)" strokeWidth="1" opacity="0.5" />

      {/* Leaf veins - right */}
      <line x1="30" y1="14" x2="42" y2="26" stroke="var(--accent-1, #4ade80)" strokeWidth="1" opacity="0.5" />

      {/* Stem highlight */}
      <path
        d="M 25 32 Q 25.5 24 25.8 16"
        stroke="var(--accent-1, #4ade80)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Sapling Illustration (Ages 8-9)
 * A growing tree with fuller foliage and visible trunk
 */
export function SaplingIllustration({ size = 48, className = "" }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ display: "block" }}
    >
      {/* Soil */}
      <ellipse cx="24" cy="40" rx="18" ry="6" fill="var(--accent-4, #8b7355)" opacity="0.8" />
      <rect x="6" y="36" width="36" height="8" fill="var(--accent-4, #8b7355)" />

      {/* Trunk */}
      <rect
        x="21"
        y="26"
        width="6"
        height="12"
        fill="var(--accent-4, #8b7355)"
        opacity="0.85"
        rx="1"
      />

      {/* Lower canopy - left */}
      <ellipse cx="14" cy="20" rx="8" ry="10" fill="var(--success, #4ade80)" opacity="0.85" />

      {/* Lower canopy - center */}
      <ellipse cx="24" cy="15" rx="10" ry="12" fill="var(--success, #4ade80)" opacity="0.9" />

      {/* Lower canopy - right */}
      <ellipse cx="34" cy="20" rx="8" ry="10" fill="var(--success, #4ade80)" opacity="0.85" />

      {/* Upper canopy - left */}
      <ellipse cx="18" cy="12" rx="6" ry="8" fill="var(--success, #4ade80)" opacity="0.8" />

      {/* Upper canopy - right */}
      <ellipse cx="30" cy="12" rx="6" ry="8" fill="var(--success, #4ade80)" opacity="0.8" />

      {/* Top point */}
      <ellipse cx="24" cy="6" rx="4" ry="6" fill="var(--success, #4ade80)" opacity="0.95" />

      {/* Trunk highlight */}
      <rect
        x="22"
        y="27"
        width="1.5"
        height="10"
        fill="var(--accent-1, #4ade80)"
        opacity="0.5"
        rx="1"
      />

      {/* Canopy highlights */}
      <ellipse cx="24" cy="13" rx="3" ry="4" fill="var(--accent-1, #4ade80)" opacity="0.5" />
      <ellipse cx="18" cy="18" rx="2" ry="3" fill="var(--accent-1, #4ade80)" opacity="0.4" />
    </svg>
  );
}

/**
 * Mighty Tree Illustration (Ages 10-12)
 * A mature evergreen tree with full canopy and substantial trunk
 */
export function MightyTreeIllustration({ size = 48, className = "" }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ display: "block" }}
    >
      {/* Soil */}
      <ellipse cx="24" cy="41" rx="20" ry="6" fill="var(--accent-4, #8b7355)" opacity="0.85" />
      <rect x="4" y="37" width="40" height="8" fill="var(--accent-4, #8b7355)" />

      {/* Main trunk */}
      <rect
        x="20"
        y="28"
        width="8"
        height="12"
        fill="var(--accent-4, #8b7355)"
        opacity="0.9"
        rx="1"
      />

      {/* Trunk bark pattern */}
      <line x1="22" y1="28" x2="22" y2="40" stroke="var(--text-secondary, #333)" strokeWidth="0.5" opacity="0.3" />

      {/* Lower canopy layer - wide base */}
      <ellipse cx="24" cy="26" rx="18" ry="14" fill="var(--success, #4ade80)" opacity="0.9" />

      {/* Middle canopy layer */}
      <ellipse cx="24" cy="16" rx="14" ry="12" fill="var(--success, #4ade80)" opacity="0.92" />

      {/* Upper canopy layer */}
      <ellipse cx="24" cy="8" rx="10" ry="10" fill="var(--success, #4ade80)" opacity="0.88" />

      {/* Top point */}
      <polygon points="24,2 28,8 20,8" fill="var(--success, #4ade80)" opacity="0.95" />

      {/* Depth - side highlights */}
      <ellipse cx="12" cy="24" rx="4" ry="10" fill="var(--success, #4ade80)" opacity="0.75" />
      <ellipse cx="36" cy="24" rx="4" ry="10" fill="var(--success, #4ade80)" opacity="0.75" />

      {/* Canopy highlights - creating depth */}
      <ellipse cx="24" cy="10" rx="5" ry="6" fill="var(--accent-1, #4ade80)" opacity="0.5" />
      <ellipse cx="18" cy="20" rx="3" ry="4" fill="var(--accent-1, #4ade80)" opacity="0.4" />
      <ellipse cx="30" cy="22" rx="3" ry="4" fill="var(--accent-1, #4ade80)" opacity="0.4" />

      {/* Trunk highlight */}
      <rect
        x="21"
        y="29"
        width="1.5"
        height="10"
        fill="var(--accent-1, #4ade80)"
        opacity="0.5"
        rx="0.75"
      />

      {/* Shadow accents - darker green */}
      <ellipse cx="16" cy="30" rx="3" ry="5" fill="var(--text-secondary, #333)" opacity="0.1" />
      <ellipse cx="32" cy="30" rx="3" ry="5" fill="var(--text-secondary, #333)" opacity="0.1" />
    </svg>
  );
}

/**
 * Age band to illustration component mapping
 */
export const AGE_ILLUSTRATION_MAP = {
  "3-5": SproutIllustration,
  "6-7": SeedlingIllustration,
  "8-9": SaplingIllustration,
  "10-12": MightyTreeIllustration,
} as const;

export type AgeBandKey = keyof typeof AGE_ILLUSTRATION_MAP;

/**
 * Helper function to get the illustration component for an age band
 * @param ageBand - Age band string (e.g., "3-5", "6-7", "8-9", "10-12")
 * @returns The corresponding illustration component, or undefined if not found
 */
export function getAgeIllustration(ageBand: string) {
  return AGE_ILLUSTRATION_MAP[ageBand as AgeBandKey];
}
