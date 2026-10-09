import { useState } from "react";
import { STATE_ART, TONE_GRADIENT, TONE_HEX } from "@/lib/state-art";
import { getState } from "@/lib/states";
import { fxTap } from "@/lib/fx";

export interface JourneyDestinationCardProps {
  stateName: string;
  status: "available" | "completed" | "locked";
  cardIndex: number;
  isInProgress?: boolean;
  cardsDone?: number;
  totalCards?: number;
  onStart?: () => void;
  onReplay?: () => void;
}

/**
 * Journey screen destination card component
 * Renders a state/UT card with:
 * - Large landmark SVG (140px)
 * - State/UT name
 * - Status indicator (completed badge, lock, or empty)
 * - Prominent action button ("Start Exploring", "Replay", or "Locked")
 * - CSS-based background (no new image assets)
 */
export function JourneyDestinationCard({
  stateName,
  status,
  cardIndex,
  isInProgress = false,
  cardsDone = 0,
  totalCards = 6,
  onStart,
  onReplay,
}: JourneyDestinationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const state = getState(stateName);
  const artSrc = STATE_ART[stateName];
  
  // Determine card background based on status
  let cardBgClass = "";
  let textColorClass = "";
  let buttonBgClass = "";
  let buttonTextClass = "";
  
  if (status === "completed") {
    const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
    cardBgClass = `bg-gradient-to-br ${grad}`;
    textColorClass = "text-white";
    buttonBgClass = `bg-gradient-to-r ${grad}`;
    buttonTextClass = "text-white";
  } else if (status === "available" || isInProgress) {
    cardBgClass = "bg-white border border-black/5";
    textColorClass = "text-slate-800";
    buttonBgClass = "gradient-saffron";
    buttonTextClass = "text-white";
  } else {
    // locked
    cardBgClass = "bg-slate-200";
    textColorClass = "text-slate-600";
    buttonBgClass = "bg-slate-400 cursor-not-allowed";
    buttonTextClass = "text-slate-100";
  }

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fxTap();
    if (status !== "locked" && onStart) {
      onStart();
    }
  };

  const handleReplayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fxTap();
    if (onReplay) {
      onReplay();
    }
  };

  const handleLockedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // No action for locked state
  };

  return (
    <div
      className={`relative rounded-2xl shadow-elevated-2 overflow-hidden flex flex-col transition-all active:scale-95 h-full ${cardBgClass}`}
      style={{ padding: "var(--padding-base)" }}
    >
      {/* Landmark SVG container */}
      <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-white shadow-sm flex items-center justify-center flex-shrink-0">
        <img
          src={artSrc}
          alt={stateName}
          className="w-full h-full object-contain"
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* State name */}
      <div className={`text-sm font-extrabold leading-tight mb-2 line-clamp-2 ${textColorClass}`}>
        {stateName}
      </div>

      {/* Status indicator */}
      {status === "locked" && (
        <div className="mb-2 flex items-center gap-1 text-sm font-bold text-slate-700">
          <span>🔒</span>
          <span>Locked</span>
        </div>
      )}

      {/* Checkmark overlay badge for completed states */}
      {status === "completed" && (
        <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-success/80 shadow-lg flex items-center justify-center backdrop-blur-sm">
          <span className="text-white text-lg font-bold leading-none">✓</span>
        </div>
      )}

      {isInProgress && (
        <div className="mb-2 text-xs font-bold opacity-75">
          <div className="mb-1">{cardsDone}/{totalCards} adventures</div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.round((cardsDone / totalCards) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Action button */}
      {status === "available" && (
        <button
          onClick={handleStartClick}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${buttonBgClass} ${buttonTextClass}`}
        >
          Start Exploring ›
        </button>
      )}

      {status === "completed" && (
        <button
          onClick={handleReplayClick}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${buttonBgClass} ${buttonTextClass}`}
        >
          Replay ↻
        </button>
      )}

      {status === "locked" && (
        <button
          onClick={handleLockedClick}
          disabled
          className={`w-full py-3 rounded-lg font-bold text-sm opacity-60 cursor-not-allowed ${buttonBgClass} ${buttonTextClass}`}
        >
          🔒 Locked
        </button>
      )}

      {isInProgress && (
        <button
          onClick={handleStartClick}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 ${buttonBgClass} ${buttonTextClass}`}
        >
          Continue ›
        </button>
      )}
    </div>
  );
}
