import { STATE_ART } from "@/lib/state-art";
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
 * - Large landmark illustration (full card top section)
 * - State/UT name
 * - Status indicator (completed badge, lock, or empty)
 * - Prominent action button ("Start Exploring", "Replay", or "Locked")
 * - Tone-specific background colors and gradient buttons
 * - Flicker-free image rendering
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
  const state = getState(stateName);
  const artSrc = STATE_ART[stateName];
  
  // Tone-specific background color mapping
  const toneBackgrounds: Record<string, string> = {
    orange: "#FFF3E8",
    gold: "#FFF9E8",
    green: "#E8F8EE",
    blue: "#E8F0FF",
  };
  
  // Gradient button class mapping per tone
  const toneGradients: Record<string, string> = {
    orange: "gradient-saffron",
    gold: "gradient-gold",
    green: "gradient-success",
    blue: "gradient-explorer",
  };
  
  // Determine card styling based on status and tone
  let cardBgColor = toneBackgrounds[state.tone] || toneBackgrounds.orange;
  let textColorClass = "text-slate-800";
  let buttonGradientClass = toneGradients[state.tone] || "gradient-saffron";
  let buttonTextClass = "text-white";
  
  if (status === "completed") {
    cardBgColor = toneBackgrounds[state.tone] || toneBackgrounds.orange;
    textColorClass = "text-slate-900";
    buttonGradientClass = toneGradients[state.tone] || "gradient-saffron";
    buttonTextClass = "text-white";
  } else if (status === "locked") {
    cardBgColor = "#F0F0F0";
    textColorClass = "text-slate-600";
    buttonGradientClass = "bg-slate-400";
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

  // Determine button text and handler based on state
  let buttonText = "Start Exploring ›";
  let buttonHandler = handleStartClick;
  let isButtonDisabled = false;
  
  if (status === "completed" && !isInProgress) {
    buttonText = "Replay ↻";
    buttonHandler = handleReplayClick;
  } else if (status === "locked") {
    buttonText = "🔒 Locked";
    isButtonDisabled = true;
    buttonHandler = () => {};
  } else if (isInProgress) {
    buttonText = "Continue ›";
    buttonHandler = handleStartClick;
  }

  return (
    <div
      className="relative clay-card clay-white overflow-hidden flex flex-col transition-all active:scale-95 h-full"
      style={{ 
        backgroundColor: cardBgColor,
        padding: "var(--padding-base)"
      }}
    >
      {/* Landmark illustration - full width, no white container */}
      <img
        src={artSrc}
        alt={stateName}
        className="w-full h-40 object-contain mb-3 flex-shrink-0 transition-opacity"
        loading="lazy"
        decoding="async"
      />

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

      {/* In-progress indicator */}
      {isInProgress && (
        <div className="mb-2 text-xs font-bold opacity-75">
          <div className="mb-1">{cardsDone}/{totalCards} adventures</div>
          <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black/30 rounded-full transition-all"
              style={{ width: `${Math.round((cardsDone / totalCards) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Single action button - consolidated logic, no duplicates */}
      <button
        onClick={buttonHandler}
        disabled={isButtonDisabled}
        className={`w-full py-3 clay-button ${status === "locked" ? "clay-white" : status === "completed" ? "clay-success" : "clay-saffron"} text-ink transition-all active:scale-95 ${isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {buttonText}
      </button>
    </div>
  );
}
