import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { getSproutStates, getProgressPercentage } from "@/lib/passport-helpers";
import { INDIA_STATES } from "@/lib/states";
import { STATE_ART } from "@/lib/state-art";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PostcardModal } from "@/components/PostcardModal";
import { fxTap, fxConfetti } from "@/lib/fx";
import mascot from "@/assets/mascot.webp";
import { EMOJI } from "@/constants/emoji";

/**
 * My Stamps for Ages 3-5 (Sprout)
 * Simplified, emoji-only, 4-6 states max per screen, visual progress bar
 */
export function PassportSprout() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [burst, setBurst] = useState(0);
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);

  const STATES_PER_PAGE = 6;
  const sproutStates = getSproutStates(progress, 24); // Get up to 24 states (4 pages)
  const statesThisPage = sproutStates.slice(
    currentPage * STATES_PER_PAGE,
    (currentPage + 1) * STATES_PER_PAGE,
  );
  const hasNextPage = (currentPage + 1) * STATES_PER_PAGE < sproutStates.length;

  const progressPct = getProgressPercentage(progress);
  const progressSegments = 6;
  const filledSegments = Math.ceil((progressPct / 100) * progressSegments);

  const handleStateClick = (stateName: string) => {
    fxTap();
    if (progress.completed.includes(stateName)) {
      // Show postcard with celebration
      if (progress.postcards[stateName]) {
        setSelectedPostcard(progress.postcards[stateName]);
        setBurst((b) => b + 1);
        return;
      }
    }
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Postcard Modal - shown on same screen */}
      {selectedPostcard && (
        <PostcardModal postcard={selectedPostcard} onClose={() => setSelectedPostcard(null)} />
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-bg-header text-text-on-header rounded-b-3xl shadow-lg">
        <div className="text-2xl font-extrabold">My Stamps 🎫</div>
      </div>

      {/* Profile Card */}
      <div className="mx-5 mt-4 p-4 rounded-3xl bg-accent-1 text-text-on-primary shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-5xl">{progress.avatar}</div>
          <div>
            <div className="text-lg font-extrabold">{progress.name}</div>
            <div className="text-xs opacity-75">Explorer</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3">
          <div className="text-xs opacity-90 mb-1">States I'm Visiting</div>
          <div className="flex gap-1">
            {Array.from({ length: progressSegments }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full transition-all ${
                  i < filledSegments ? "bg-accent-3" : "bg-surface-card/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="px-5 pt-4 pb-2 flex-1 overflow-auto">
        <div className="text-sm font-bold text-muted-foreground mb-3">
          {EMOJI.utility.worldMap} Time to Explore!
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {statesThisPage.map((state) => {
            const isUnlocked = progress.completed.includes(state.name);
            return (
              <button
                key={state.name}
                onClick={() => handleStateClick(state.name)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition transform ${
                  isUnlocked
                    ? "bg-accent-4 shadow-lg hover:scale-105 active:scale-95"
                    : "bg-surface-sunken hover:bg-surface-sunken active:scale-95"
                }`}
              >
                <img
                  src={STATE_ART[state.name]}
                  alt={state.name}
                  className="w-12 h-12 object-cover rounded"
                  loading="lazy"
                  decoding="async"
                />
                {isUnlocked && <div className="text-xs font-bold text-warning">Tap!</div>}
                {!isUnlocked && <div className="text-lg">🔒</div>}
              </button>
            );
          })}
        </div>

        {/* Locked State Encouragement */}
        {statesThisPage.some((s) => !progress.completed.includes(s.name)) && (
          <div className="bg-accent-5-soft border-2 border-accent-5 rounded-2xl p-3 text-center">
            <div className="text-sm font-bold text-accent-5-ink">
              🌟 Complete quizzes to unlock more!
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-5 pb-4 flex gap-2">
        {currentPage > 0 && (
          <button
            onClick={() => {
              fxTap();
              setCurrentPage(currentPage - 1);
            }}
            className="flex-1 h-12 rounded-2xl bg-surface-card border-2 border-border-color text-text-secondary font-extrabold text-lg"
          >
            ← Previous
          </button>
        )}
        {hasNextPage && (
          <button
            onClick={() => {
              fxTap();
              setCurrentPage(currentPage + 1);
            }}
            className="flex-1 h-12 rounded-2xl bg-accent-2 text-text-on-primary font-extrabold text-lg shadow-lg"
          >
            Next States →
          </button>
        )}
        {!hasNextPage && currentPage === 0 && (
          <button
            onClick={() => navigate({ to: "/home" })}
            className="flex-1 h-12 rounded-2xl bg-accent-3 text-text-on-primary font-extrabold text-lg shadow-lg"
          >
            Back Home {EMOJI.nav.home}
          </button>
        )}
      </div>
    </div>
  );
}
