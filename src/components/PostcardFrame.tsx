import { STATE_ART, TONE_GRADIENT } from "@/lib/state-art";
import { getState } from "@/lib/states";
import { type BadgeId } from "@/lib/progress";
import { EMOJI } from "@/constants/emoji";

interface PostcardFrameProps {
  stateName: string;
  stars?: "1" | "2" | "3";
  date?: string;
  badge?: BadgeId;
}

/**
 * PostcardFrame component - displays postcard with colorful postage border
 * Used in QuizCeremony to show the earned postcard
 *
 * Features:
 * - Colorful dashed border like postage stamps
 * - "Your Postcard!" label with emoji
 * - State illustration, name, and minimal info
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
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";

  return (
    <div className="flex justify-center w-full">
      {/* Postcard with colorful postage border */}
      <div className="w-full max-w-sm relative">
        {/* Colorful postage border using box-shadow to create dashed effect */}
        <div
          className="w-full rounded-2xl shadow-lg p-4 bg-white relative overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 8px 8px, transparent 8px, white 8px),
              radial-gradient(circle at 8px 8px, transparent 8px, white 8px),
              linear-gradient(90deg, 
                #FF4444 0px, #FF4444 6px,
                #4455FF 6px, #4455FF 12px,
                #FF44BB 12px, #FF44BB 18px,
                #44DDFF 18px, #44DDFF 24px)
            `,
            backgroundPosition: '0 0, 0 100%, 0 0',
            backgroundSize: '16px 16px, 16px 16px, 24px 100%',
            backgroundRepeat: 'repeat-x, repeat-x, no-repeat',
            border: '4px solid transparent',
          }}
        >
          {/* Inner white card */}
          <div className="w-full bg-white rounded-xl relative">
            {/* "Your Postcard!" label - positioned absolutely at top-left */}
            <div className="absolute -top-2 left-3 z-10">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-accent-1 to-purple-600 text-white px-3 py-1 rounded-lg shadow-md text-xs font-bold">
                <span>📮</span>
                <span>Your Postcard!</span>
              </div>
            </div>

            {/* Postcard content - 3:2 aspect ratio */}
            <div className="aspect-[3/2] flex flex-col items-center justify-center pt-6 pb-4 px-4 relative">
              {/* State illustration */}
              <div className="flex-1 flex items-center justify-center mb-2">
                {art ? (
                  <img
                    src={art}
                    alt={state.name}
                    className="h-full object-contain max-h-20"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="text-4xl">{state.emoji || EMOJI.language.indFlag}</div>
                )}
              </div>

              {/* State name */}
              <div className="text-center font-bold text-text-primary text-lg">
                {state.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
