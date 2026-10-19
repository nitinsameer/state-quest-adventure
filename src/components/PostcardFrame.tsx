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
      {/* Postcard Frame - 3:2 aspect ratio, white background with shadow */}
      <div className="w-full max-w-sm bg-surface-card rounded-xl shadow-lg border border-border-color p-5 relative overflow-hidden">
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

          {/* Middle section - State name + badge level */}
          <div className="flex-[1] flex flex-col items-center justify-center py-1">
            <div className="text-center">
              <div className="text-sm font-bold text-text-primary">{state.name}</div>
              <div className="text-xs font-semibold text-text-secondary mt-0.5">
                Level 1 · {badgeLabel}
              </div>
            </div>
          </div>

          {/* Bottom section - Date left, Stars right, Stamp top-right */}
          <div className="flex-[1] flex items-center justify-between px-2 py-1 relative">
            {/* Left: Date */}
            <div className="text-xs font-semibold text-text-secondary tabular-nums">{dateStr}</div>

            {/* Right: Stars */}
            <div className="text-xs leading-none">{starDisplay}</div>

            {/* Top-right: Stamp (rotated 15deg, absolutely positioned) */}
            <div
              className="absolute top-1 right-2 text-lg opacity-80 transform"
              style={{ transform: "rotate(15deg)" }}
              title="Stamp"
            >
              📮
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
