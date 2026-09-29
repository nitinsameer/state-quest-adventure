/**
 * PostcardCard - Individual postcard display in library
 * 
 * Shows:
 * - Postcard preview/thumbnail
 * - State name and earned badge
 * - Date earned
 * - Consent state indicator
 * - Checkbox for bulk selection
 * - Tap to open consent dialog
 */

import type { LibraryPostcard } from "@/lib/postcard-library";
import { fxTap } from "@/lib/fx";

const BADGE_EMOJI: Record<string, string> = {
  monument: "🏛️",
  animal: "🐾",
  explorer: "🎖️",
};

const CONSENT_INDICATOR = {
  accepted: { emoji: "✅", label: "Consent", color: "bg-green-100 border-green-300" },
  declined: { emoji: "❌", label: "Declined", color: "bg-red-100 border-red-300" },
  pending: { emoji: "⏳", label: "Pending", color: "bg-amber-100 border-amber-300" },
};

export interface PostcardCardProps {
  postcard: LibraryPostcard;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onTapConsent?: () => void;
}

export function PostcardCard({
  postcard,
  isSelected = false,
  onToggleSelect,
  onTapConsent,
}: PostcardCardProps) {
  const consentInfo = CONSENT_INDICATOR[postcard.consentState];
  const badgeEmoji = BADGE_EMOJI[postcard.badge] || "🎖️";

  // Parse date from ISO timestamp
  const dateObj = new Date(postcard.generatedAt);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCardClick = () => {
    fxTap();
    onTapConsent?.();
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer ${
        isSelected ? "ring-4 ring-blue-500" : ""
      }`}
    >
      {/* Postcard Preview Background */}
      <div className="aspect-[3/4] bg-gradient-to-br from-orange-300 via-yellow-300 to-orange-200 relative flex flex-col items-center justify-center p-4">
        {/* State Emoji or Art Placeholder */}
        <div className="text-6xl mb-2">🎨</div>

        {/* State Name */}
        <h3 className="text-center text-h4 text-white drop-shadow leading-tight">
          {postcard.state}
        </h3>

        {/* Badge Earned */}
        <div className="mt-2 text-4xl">{badgeEmoji}</div>

        {/* Date */}
        <div className="mt-auto pt-4 text-center text-caption text-white/90">
          {postcard.stampDate}
        </div>
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex flex-col items-start justify-start p-3 gap-2">
        {/* Checkbox for Bulk Selection */}
        {onToggleSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
              isSelected
                ? "bg-blue-500 border-blue-600"
                : "bg-white/80 border-gray-300 hover:bg-white"
            }`}
          >
            {isSelected && <span className="text-white font-bold text-sm">✓</span>}
          </button>
        )}

        {/* Consent Badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`ml-auto rounded-lg border-2 px-2 py-1 text-label transition hover:scale-110 ${consentInfo.color}`}
          title={`Tap to change consent state (currently ${consentInfo.label})`}
        >
          {consentInfo.emoji}
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="text-caption text-gray-700">{dateStr}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="ml-auto text-body font-bold text-blue-600 hover:text-blue-700 transition"
          title="Tap to manage consent"
        >
          {consentInfo.label}
        </button>
      </div>

      {/* Click Handler Area */}
      <div
        onClick={handleCardClick}
        className="absolute inset-0 cursor-pointer"
        title="Tap to manage consent and postcard details"
      />
    </div>
  );
}
