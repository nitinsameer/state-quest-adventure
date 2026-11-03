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
 * PostcardFrame component - displays postcard as a physical postcard within a rectangle frame
 * Used in QuizCeremony to show the earned postcard
 *
 * Layout:
 * - White background with rounded corners, shadow, padding
 * - 3:2 aspect ratio (postcard-like)
 * - Top (40% height): centered state illustration from STATE_ART
 * - Middle: state name + badge level center-aligned
 * - Bottom split: Left date, Right stars, Top-right stamp rotated 15deg
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

  // Format date for postcard (e.g., "15 · Jan")
  const [day, month] = date.split(" ").slice(0, 2).join(" ").split(" ").filter(Boolean);
  const dateStr = `${day} · ${month}`;

  // Star display
  const starCount = parseInt(stars) || 3;
  const starDisplay = EMOJI.action.star.repeat(starCount);

  // Badge labels
  const badgeLabel = badge === "monument" ? "Monument" : badge === "animal" ? "Animal" : "Explorer";

  return (
    <div className="flex justify-center">
      {/* Postcard outer wrapper with colorful border */}
      <div className="relative w-full max-w-sm">
        {/* Colorful dashed postage border */}
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
          background: `
            repeating-linear-gradient(90deg, 
              #FF4444 0px, #FF4444 3px,
              #4444FF 3px, #4444FF 6px,
              #FF44FF 6px, #FF44FF 9px,
              #44CCFF 9px, #44CCFF 12px)`,
          padding: '3px'
        }}>
          <div className="w-full h-full bg-surface-card rounded-xl"></div>
        </div>

        {/* Postcard Frame - 3:2 aspect ratio, white background with shadow */}
        <div className="w-full max-w-sm bg-surface-card rounded-xl shadow-lg p-5 relative overflow-hidden" style={{
          border: '3px dashed transparent',
          backgroundImage: `
            linear-gradient(white, white),
            repeating-linear-gradient(90deg,
              #FF4444 0px, #FF4444 3px,
              #4444FF 3px, #4444FF 6px,
              #FF44FF 6px, #FF44FF 9px,
              #44CCFF 9px, #44CCFF 12px)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        }}>
          {/* "Your Postcard!" label at top */}
          <div className="absolute -top-4 left-0 right-0 flex justify-start z-10">
            <div className="flex items-center gap-2 bg-accent-1 text-white px-3 py-1 rounded-lg shadow-md ml-4">
              <span className="text-sm font-bold">📮 Your Postcard!</span>
            </div>
          </div>

          {/* Aspect ratio 3:2 container */}
          <div className="aspect-[3/2] flex flex-col relative">
          {/* Top section (40% height) - State illustration centered */}
          <div className="flex-[2] flex items-center justify-center pb-2">
            {art ? (
              <img
                src={art}
                alt={state.name}
                className="h-full object-contain max-h-24"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="text-4xl">{state.emoji || EMOJI.language.indFlag}</div>
            )}
          </div>

          {/* Middle section - State name (enlarged, no badge level) */}
          <div className="flex-[1] flex flex-col items-center justify-center py-1">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{state.name}</div>
            </div>
          </div>

          {/* Bottom section - Empty/minimal space */}
          <div className="flex-[1] flex items-center justify-between px-2 py-1 relative">
            {/* Blank - no date, no stars, no stamp */}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
