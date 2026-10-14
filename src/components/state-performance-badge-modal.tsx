/**
 * State Performance Badge Detail Modal
 * Shows detailed info about all badges for a specific state
 */

import { useState } from "react";
import type { Progress } from "@/lib/progress";
import {
  getPerformanceBadgesForState,
  getAvailablePerformanceBadges,
  getPerformanceBadgeProgress,
  STATE_PERFORMANCE_BADGE_DEFS,
  getPerformanceBadgeIcon,
  type StatePerformanceBadgeId,
  getStatePerformance,
} from "@/lib/state-performance-badges";
import { fxTap } from "@/lib/fx";

interface StatePerformanceBadgeModalProps {
  stateName: string;
  progress: Progress;
  onClose: () => void;
}

// Helper to generate progress stars (e.g â­â­â˜†)
const getProgressStars = (progress: number, max: number): string => {
  if (max === 0) return "";
  const filledCount = Math.min(Math.ceil((progress / max) * 3), 3);
  const stars = "â­".repeat(filledCount) + "â˜†".repeat(3 - filledCount);
  return stars;
};

export function StatePerformanceBadgeModal({
  stateName,
  progress,
  onClose,
}: StatePerformanceBadgeModalProps) {
  const earnedBadges = getPerformanceBadgesForState(progress.statePerformance, stateName);
  const availableBadges = getAvailablePerformanceBadges(progress.statePerformance, stateName);
  const badgeProgress = getPerformanceBadgeProgress(progress.statePerformance, stateName);
  const metrics = getStatePerformance(progress, stateName);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={() => {
        fxTap();
        onClose();
      }}
    >
      <div
        className="w-full bg-white rounded-t-4xl p-5 max-h-[90vh] overflow-auto flex flex-col gap-5 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-display font-extrabold text-2xl text-muted-dark">
              {stateName} Badges
            </h2>
          </div>
          <button
            onClick={() => {
              fxTap();
              onClose();
            }}
            className="text-2xl text-muted-light hover:text-muted-foreground transition"
          >
            âœ•
          </button>
        </div>

        {/* Metrics Summary - REMOVED */}

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h3 className="text-display font-extrabold text-lg mb-3 text-muted-dark">
              âœ“ You Did It!
            </h3>
            <div className="space-y-3">
              {earnedBadges.map(badgeId => (
                <BadgeDetailCard
                  key={badgeId}
                  badgeId={badgeId}
                  progress={badgeProgress[badgeId]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges */}
        {availableBadges.length > 0 && (
          <div>
            <h3 className="text-display font-extrabold text-lg mb-3 text-muted-dark">
              Keep Exploring! ⭐
            </h3>
            <div className="space-y-3">
              {availableBadges.map(badgeId => (
                <BadgeDetailCard
                  key={badgeId}
                  badgeId={badgeId}
                  progress={badgeProgress[badgeId]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => {
            fxTap();
            onClose();
          }}
          className="mt-4 w-full h-11 rounded-2xl ui-button ui-accent-1-soft text-ink font-bold transition active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface BadgeDetailCardProps {
  badgeId: StatePerformanceBadgeId;
  progress: { earned: boolean; progress: number; max: number; message: string };
}

function BadgeDetailCard({ badgeId, progress }: BadgeDetailCardProps) {
  const badgeDef = STATE_PERFORMANCE_BADGE_DEFS[badgeId];

  return (
    <div
      className={`rounded-2xl p-4 border-2 transition ${
        progress.earned
          ? "ui-card ui-accent-4 shadow-md border-accent-4"
          : "ui-card ui-accent-1-soft border-muted opacity-60"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className={`text-4xl flex-shrink-0 ${!progress.earned && "opacity-50"}`}>
          {getPerformanceBadgeIcon(badgeId)}
        </div>

        {/* Badge Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`text-display font-extrabold text-lg ${progress.earned ? "text-ink" : "text-muted-foreground"}`}>
              {badgeDef.name}
            </h4>
          </div>

          <p className="text-xs font-bold text-muted-foreground mt-1">
            {badgeDef.description}
          </p>

          {/* Status Section */}
          <div className="mt-3 pt-3 border-t border-white/20">
            {progress.earned ? (
              <div className="flex flex-col gap-1">
                <div className="text-lg font-extrabold text-ink">âœ“ You Did It!</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-lg">{getProgressStars(progress.progress, progress.max)}</div>
                <div className="text-[11px] font-bold text-muted-foreground">
                  Keep going! ⭐
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


