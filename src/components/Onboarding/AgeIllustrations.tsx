/**
 * Age Band Illustrations Component
 * 
 * SVG illustrations for age selection cards
 * - Sprout: Young growing plant (3-4 leaves, light green)
 * - Seedling: Small developed plant with fuller leaves
 * - Sapling: Young tree with visible trunk and foliage
 * - MightyTree: Mature evergreen tree, full and robust
 * 
 * Each component accepts optional className prop and returns SVG element (48x48 minimum, viewBox="0 0 48 48")
 */

interface IllustrationProps {
  className?: string;
}

export function SproutIllustration({ className = "" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-12 h-12 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sprout - Young growing plant"
    >
      {/* Soil/Ground */}
      <ellipse cx="24" cy="40" rx="14" ry="4" fill="#C4A57B" opacity="0.3" />
      
      {/* Stem - thin and small */}
      <line x1="24" y1="40" x2="24" y2="28" stroke="#7CB342" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Left leaf 1 */}
      <ellipse cx="18" cy="35" rx="4" ry="6" fill="#9CCC65" transform="rotate(-35 18 35)" />
      
      {/* Left leaf 2 */}
      <ellipse cx="16" cy="28" rx="3.5" ry="5" fill="#AED581" transform="rotate(-40 16 28)" />
      
      {/* Right leaf 1 */}
      <ellipse cx="30" cy="35" rx="4" ry="6" fill="#9CCC65" transform="rotate(35 30 35)" />
      
      {/* Top leaf */}
      <ellipse cx="24" cy="22" rx="3" ry="5" fill="#CDDC39" />
      
      {/* Highlight on top leaf */}
      <ellipse cx="25" cy="20" rx="1.5" ry="2" fill="#EEFF41" opacity="0.6" />
    </svg>
  );
}

export function SeedlingIllustration({ className = "" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-12 h-12 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Seedling - Small developed plant with fuller leaves"
    >
      {/* Soil/Ground */}
      <ellipse cx="24" cy="40" rx="14" ry="4" fill="#C4A57B" opacity="0.3" />
      
      {/* Stem - small but defined */}
      <line x1="24" y1="40" x2="24" y2="26" stroke="#558B2F" strokeWidth="2" strokeLinecap="round" />
      
      {/* Left leaf 1 - lower */}
      <ellipse cx="16" cy="34" rx="4.5" ry="7" fill="#8BC34A" transform="rotate(-40 16 34)" />
      
      {/* Left leaf 2 - middle */}
      <ellipse cx="14" cy="28" rx="4" ry="6.5" fill="#9CCC65" transform="rotate(-45 14 28)" />
      
      {/* Left leaf 3 - upper */}
      <ellipse cx="15" cy="20" rx="3.5" ry="6" fill="#AED581" transform="rotate(-30 15 20)" />
      
      {/* Right leaf 1 - lower */}
      <ellipse cx="32" cy="34" rx="4.5" ry="7" fill="#8BC34A" transform="rotate(40 32 34)" />
      
      {/* Right leaf 2 - middle */}
      <ellipse cx="34" cy="28" rx="4" ry="6.5" fill="#9CCC65" transform="rotate(45 34 28)" />
      
      {/* Right leaf 3 - upper */}
      <ellipse cx="33" cy="20" rx="3.5" ry="6" fill="#AED581" transform="rotate(30 33 20)" />
      
      {/* Top center leaf */}
      <ellipse cx="24" cy="16" rx="3.5" ry="6" fill="#CDDC39" />
      
      {/* Highlights */}
      <ellipse cx="25" cy="14" rx="1.5" ry="2" fill="#EEFF41" opacity="0.6" />
      <ellipse cx="16.5" cy="27" rx="1" ry="1.5" fill="#EEFF41" opacity="0.4" />
      <ellipse cx="31.5" cy="27" rx="1" ry="1.5" fill="#EEFF41" opacity="0.4" />
    </svg>
  );
}

export function SaplingIllustration({ className = "" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-12 h-12 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sapling - Young tree with visible trunk and foliage"
    >
      {/* Soil/Ground */}
      <ellipse cx="24" cy="42" rx="16" ry="4" fill="#8D6E63" opacity="0.4" />
      
      {/* Trunk - visible and brown */}
      <rect x="22" y="30" width="4" height="12" rx="2" fill="#A1887F" />
      <rect x="22.5" y="30" width="3" height="12" fill="#8D6E63" opacity="0.5" />
      
      {/* Lower foliage cluster - left */}
      <ellipse cx="14" cy="28" rx="5.5" ry="8" fill="#558B2F" transform="rotate(-25 14 28)" />
      <ellipse cx="12" cy="22" rx="5" ry="7" fill="#6D8659" transform="rotate(-35 12 22)" />
      
      {/* Lower foliage cluster - right */}
      <ellipse cx="34" cy="28" rx="5.5" ry="8" fill="#558B2F" transform="rotate(25 34 28)" />
      <ellipse cx="36" cy="22" rx="5" ry="7" fill="#6D8659" transform="rotate(35 36 22)" />
      
      {/* Middle foliage cluster */}
      <circle cx="24" cy="20" r="6" fill="#7CB342" />
      <ellipse cx="20" cy="16" rx="4.5" ry="6" fill="#8BC34A" />
      <ellipse cx="28" cy="16" rx="4.5" ry="6" fill="#8BC34A" />
      
      {/* Upper foliage - pointed top */}
      <ellipse cx="24" cy="10" rx="3.5" ry="5" fill="#9CCC65" />
      
      {/* Highlights */}
      <ellipse cx="26" cy="18" rx="2" ry="2.5" fill="#CDDC39" opacity="0.5" />
      <ellipse cx="16" cy="26" rx="1.5" ry="2" fill="#AED581" opacity="0.4" />
      <ellipse cx="32" cy="26" rx="1.5" ry="2" fill="#AED581" opacity="0.4" />
    </svg>
  );
}

export function MightyTreeIllustration({ className = "" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-12 h-12 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mighty Tree - Mature evergreen tree, full and robust"
    >
      {/* Soil/Ground */}
      <ellipse cx="24" cy="44" rx="18" ry="4" fill="#5D4037" opacity="0.5" />
      
      {/* Trunk - substantial */}
      <rect x="21" y="28" width="6" height="16" rx="2" fill="#795548" />
      <rect x="21.5" y="28" width="4.5" height="16" fill="#6D4C41" opacity="0.6" />
      
      {/* Lower tier of foliage - wide base */}
      <ellipse cx="12" cy="26" rx="6" ry="9" fill="#33691E" transform="rotate(-25 12 26)" />
      <ellipse cx="36" cy="26" rx="6" ry="9" fill="#33691E" transform="rotate(25 36 26)" />
      <ellipse cx="24" cy="32" rx="7" ry="7" fill="#388E3C" />
      
      {/* Middle tier */}
      <ellipse cx="16" cy="20" rx="5.5" ry="7.5" fill="#43A047" transform="rotate(-30 16 20)" />
      <ellipse cx="32" cy="20" rx="5.5" ry="7.5" fill="#43A047" transform="rotate(30 32 20)" />
      <ellipse cx="24" cy="18" rx="6.5" ry="7" fill="#558B2F" />
      
      {/* Upper tier - more compact */}
      <ellipse cx="20" cy="12" rx="4.5" ry="6" fill="#558B2F" />
      <ellipse cx="28" cy="12" rx="4.5" ry="6" fill="#558B2F" />
      <ellipse cx="24" cy="8" rx="5" ry="6" fill="#6D8659" />
      
      {/* Top point - dark evergreen */}
      <ellipse cx="24" cy="4" rx="3" ry="4" fill="#33691E" />
      
      {/* Highlights - multiple to show depth */}
      <ellipse cx="27" cy="16" rx="2.5" ry="3" fill="#7CB342" opacity="0.6" />
      <ellipse cx="26" cy="9" rx="2" ry="2.5" fill="#9CCC65" opacity="0.5" />
      <ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#8BC34A" opacity="0.4" />
      <ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#8BC34A" opacity="0.4" />
    </svg>
  );
}
