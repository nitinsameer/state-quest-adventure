import { useState } from "react";
import { fxTap } from "@/lib/fx";

interface PostcardCardProps {
  destination: string;
  landmarkSrc: string;
  isCollected: boolean;
  region: string;
  onClick: () => void;
}

/**
 * Reusable Postcard Card component for all 36 states/UTs
 * Uses existing landmark SVGs with CSS styling to create postcard appearance
 * Locked state: muted SVG with lock overlay
 * Collected state: full color SVG with collected badge
 */
export function PostcardCard({
  destination,
  landmarkSrc,
  isCollected,
  onClick,
}: PostcardCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    fxTap();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-2 rounded-xl transition-transform active:scale-95"
      title={`${destination} postcard`}
    >
      <div className="relative">
        {/* Postcard container */}
        <div className="relative bg-surface-card rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
          {/* Landmark SVG container - full color for all states, padlock badge for locked */}
          <div className="relative">
            <div
              className={`w-full h-32 rounded-lg overflow-hidden mb-3 bg-surface-card shadow-sm transition-opacity duration-300 ${
                isCollected ? "opacity-100" : "opacity-75"
              }`}
            >
              <img
                src={landmarkSrc}
                alt={destination}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Padlock badge for locked state */}
            {!isCollected && (
              <div className="absolute top-2 right-2 w-8 h-8 bg-surface-card/90 rounded-full shadow-md flex items-center justify-center border-2 border-border-strong">
                <span className="text-lg">🔒</span>
              </div>
            )}
          </div>

          {/* State name - centered, larger */}
          <div className="font-extrabold text-center mb-2 line-clamp-2" style={{ fontSize: 'var(--type-state-name)', fontWeight: 'var(--type-state-name-weight)', color: 'var(--color-ink)' }}>
            {destination}
          </div>

          {/* Status text */}
          <div className="text-sm font-bold text-center" style={{ color: isCollected ? 'var(--feedback-success)' : 'var(--text-muted)' }}>
            {isCollected ? (
              <span className="inline-flex items-center gap-1">
                <span>✓</span>
                <span>Collected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span>🎫</span>
                <span>Visit to collect</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
