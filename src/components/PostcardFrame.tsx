import { STATE_ART, TONE_GRADIENT } from "@/lib/state-art";
import { getState } from "@/lib/states";
import { type BadgeId } from "@/lib/progress";
import { EMOJI } from "@/constants/emoji";
import airmailFrame from "@/assets/Airmail Postcard Frame with Purple Cancellation Stamp.png";

interface PostcardFrameProps {
  stateName: string;
  stars?: "1" | "2" | "3";
  date?: string;
  badge?: BadgeId;
}

/**
 * PostcardFrame component - displays postcard with airmail frame overlay
 * Used in QuizCeremony to show the earned postcard
 *
 * Features:
 * - State illustration in center
 * - Transparent airmail frame PNG overlay with purple cancellation stamp
 * - State name text below the frame
 * - Rounded corners matching reference
 */
export function PostcardFrame({
  stateName,
  stars = "3",
  date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  badge = "explorer",
}: PostcardFrameProps) {
  const state = getState(stateName);
  const art = STATE_ART[state.name];

  return (
    <div className="flex justify-center w-full">
      {/* Postcard container with frame overlay */}
      <div className="w-full max-w-sm relative">
        {/* Main postcard area with rounded corners */}
        <div className="w-full rounded-2xl shadow-lg bg-white relative overflow-hidden">
          {/* Postcard content container - maintains aspect ratio */}
          <div className="aspect-[3/2] sm:aspect-[4/3] flex flex-col items-center justify-center p-6 relative bg-surface-card">
            {/* State illustration - centered background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-100">
              {art ? (
                <img
                  src={art}
                  alt={state.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="text-6xl">{state.emoji || EMOJI.language.indFlag}</div>
              )}
            </div>

            {/* Airmail frame overlay - positioned absolute, fully covers postcard */}
            <img
              src={airmailFrame}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              style={{
                pointerEvents: "none",
                objectFit: "cover",
              }}
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />

            {/* State name text - positioned at bottom, above frame elements */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-10">
              <div className="font-bold text-text-primary text-base px-3">
                {state.name}
              </div>
            </div>
          </div>

          {/* "Your Postcard!" label - positioned at top-left */}
          <div className="absolute -top-2 left-3 z-20">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-accent-1 to-purple-600 text-white px-3 py-1 rounded-lg shadow-md text-xs font-bold">
              <span>📮</span>
              <span>Your Postcard!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
