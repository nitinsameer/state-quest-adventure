/**
 * State Performance Badges View
 * Shows badges earned for each individual state
 */

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import {
  getPerformanceBadgesForState,
  getAvailablePerformanceBadges,
  getPerformanceBadgeProgress,
  STATE_PERFORMANCE_BADGE_DEFS,
  getPerformanceBadgeIcon,
  getTotalPerformanceBadgesEarned,
  type StatePerformanceBadgeId,
} from "@/lib/state-performance-badges";
import { INDIA_STATES } from "@/lib/states";
import { fxTap } from "@/lib/fx";
import { getAvatarImage, getAvatarName } from "@/lib/avatar-config";
import { StatePerformanceBadgeModal } from "./state-performance-badge-modal";
import { EMOJI } from "@/constants/emoji";

export function StatePerformanceBadgesView() {
  const progress = useProgress();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const totalBadgesEarned = getTotalPerformanceBadgesEarned(progress.statePerformance);
  const totalPossible = INDIA_STATES.length * 6; // 6 performance badges per state (correct)

  const completedStates = INDIA_STATES.filter((s) => progress.completed.includes(s.name));
  const lockedStates = INDIA_STATES.filter((s) => !progress.completed.includes(s.name));

  return (
    <div className="h-full w-full bg-bg-page flex flex-col">
      {/* Header - Kid-friendly celebration style */}
      <div className="px-5 pt-3 pb-4 rounded-b-[32px] relative overflow-hidden" style={{backgroundColor: "var(--accent-4)", color: "var(--accent-4-ink)"}}>
        <div className="absolute top-2 right-4 text-5xl opacity-40 pointer-events-none">{EMOJI.milestone.hundred}</div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl ui-card ui-accent-1-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={getAvatarImage(progress.avatar)}
              alt={getAvatarName(progress.avatar)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1" style={{ color: "var(--text-on-header)" }}>
            <div className="text-display text-lg font-bold leading-tight">
              {progress.name}
            </div>
            <div
              className="text-xs font-bold"
              style={{ color: "var(--text-on-header)", opacity: 0.8 }}
            >
              {EMOJI.action.celebrate} {totalBadgesEarned} Amazing State Badges!
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle - REMOVED */}

      {/* Content - Card View Only */}
      <div className="flex-1 overflow-auto px-5 py-4 space-y-6">
        {/* Completed States */}
        {completedStates.length > 0 && (
          <div>
            <h2 className="text-display font-extrabold text-lg mb-4 text-text-primary">
              {EMOJI.milestone.hundred} Completed ({completedStates.length})
            </h2>

            <div className="space-y-4">
              {completedStates.map((state) => (
                <StateDetailBadgeCard
                  key={state.name}
                  state={state}
                  progress={progress}
                  onSelect={() => {
                    fxTap();
                    setSelectedState(state.name);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked States */}
        {lockedStates.length > 0 && (
          <div>
            <h2 className="text-display font-extrabold text-lg mb-4 text-text-primary">
              {EMOJI.action.fire} Not Started ({lockedStates.length})
            </h2>

            <div className="space-y-4">
              {lockedStates.map((state) => (
                <div
                  key={state.name}
                  className="rounded-2xl p-4 bg-surface-card shadow-soft border border-border-subtle"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{EMOJI.action.fire}</div>
                    <div className="flex-1">
                      <h3 className="text-display font-extrabold text-text-primary">
                        {state.name}
                      </h3>
                      <p className="text-xs font-bold text-text-secondary mt-1">Not yet started</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedState && (
        <StatePerformanceBadgeModal
          stateName={selectedState}
          progress={progress}
          onClose={() => setSelectedState(null)}
        />
      )}
    </div>
  );
}

/* ========== Card View Component (Only View) ========== */
function StateDetailBadgeCard({ state, progress, onSelect }: any) {
  const earnedBadges = getPerformanceBadgesForState(progress.statePerformance, state.name);
  const availableBadges = getAvailablePerformanceBadges(progress.statePerformance, state.name);
  const totalBadges = 6; // 6 performance badges per state

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl p-4 ui-card ui-accent-1-soft text-left hover:shadow-md transition active:scale-[0.99]"
    >
      {/* State Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-display font-extrabold text-lg text-text-primary">{state.name}</h3>
        </div>
      </div>

      {/* All Badge Icons (Earned + Locked) */}
      <div className="mt-4 flex gap-2 flex-wrap items-center">
        {/* Earned badges - colored circles */}
        {earnedBadges.map((badge: StatePerformanceBadgeId) => (
          <div
            key={badge}
            className="h-8 w-8 rounded-full bg-accent-1 border-2 border-action-primary-bg flex items-center justify-center text-base flex-shrink-0"
            title={STATE_PERFORMANCE_BADGE_DEFS[badge]?.name}
          >
            {getPerformanceBadgeIcon(badge)}
          </div>
        ))}

        {/* Locked badges - greyed with lock icon */}
        {availableBadges.map((badge: StatePerformanceBadgeId) => (
          <div
            key={badge}
            className="h-8 w-8 rounded-full bg-text-muted border-2 border-text-muted flex items-center justify-center text-xs opacity-50 flex-shrink-0 relative"
            title={`${STATE_PERFORMANCE_BADGE_DEFS[badge]?.name}`}
          >
            <span className="absolute text-xs">{EMOJI.action.fire}</span>
          </div>
        ))}
      </div>

      {/* Kid-friendly copy */}
      <div className="mt-3 text-xs font-bold text-action-primary-bg">
        Keep exploring! {EMOJI.action.star}
      </div>
    </button>
  );
}
