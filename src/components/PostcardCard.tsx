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
      className="w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl transition-transform active:scale-95"
      title={`${destination} postcard`}
    >
      <div className="relative">
        {/* Postcard container with warm paper-like background */}
        <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
          {/* Dashed/perforated border effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-dashed border-amber-300/50 pointer-events-none" />

          {/* Landmark SVG container */}
          <div
            className={`w-full h-32 rounded-lg overflow-hidden mb-3 bg-white shadow-sm transition-opacity duration-300 ${
              isCollected ? "opacity-100" : "opacity-60"
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

            {/* Locked state overlay */}
            {!isCollected && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs font-bold text-white">Locked</div>
                </div>
              </div>
            )}
          </div>

          {/* State name */}
          <div className="text-sm font-extrabold text-ink mb-2 line-clamp-2">{destination}</div>

          {/* Status badge */}
          <div className="text-xs font-bold text-muted-dark">
            {isCollected ? (
              <span className="inline-flex items-center gap-1 text-green-700">
                <span>✓</span>
                <span>Collected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <span>🔒</span>
                <span>Explore to earn</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
