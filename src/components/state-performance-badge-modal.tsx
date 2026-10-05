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
            <p className="text-xs font-bold text-muted-foreground mt-1">
              {earnedBadges.length}/9 Badges Earned
            </p>
          </div>
          <button
            onClick={() => {
              fxTap();
              onClose();
            }}
            className="text-2xl text-muted-light hover:text-muted transition"
          >
            ✕
          </button>
        </div>

        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-orange-soft rounded-2xl border border-orange-200">
            <div>
              <div className="text-xs font-bold text-muted-foreground">Quiz Score</div>
              <div className="text-2xl font-extrabold text-orange mt-1">
                {metrics.quizScore}%
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground">Time Taken</div>
              <div className="text-2xl font-extrabold text-orange mt-1">
                {Math.round(metrics.timeToComplete / 60000)}m
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground">Cards Read</div>
              <div className="text-2xl font-extrabold text-orange mt-1">
                {metrics.cardsRead}/6
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground">Quiz Attempts</div>
              <div className="text-2xl font-extrabold text-orange mt-1">
                {metrics.quizAttempts}
              </div>
            </div>
          </div>
        )}

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h3 className="text-display font-extrabold text-lg mb-3 text-muted-dark">
              ✓ Earned Badges ({earnedBadges.length})
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

        {/* Available Badges */}
        {availableBadges.length > 0 && (
          <div>
            <h3 className="text-display font-extrabold text-lg mb-3 text-muted-dark">
              ⏳ Available Badges ({availableBadges.length})
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
          className="mt-4 w-full py-3 rounded-2xl bg-orange-soft0 text-white font-bold text-lg transition active:scale-95"
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
          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300"
          : "bg-muted-light border-muted"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className={`text-4xl ${!progress.earned && "opacity-50"}`}>
          {getPerformanceBadgeIcon(badgeId)}
        </div>

        {/* Badge Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`text-display font-extrabold ${progress.earned ? "text-orange-900" : "text-muted"}`}>
              {badgeDef.name}
            </h4>
            {progress.earned && <div className="text-lg">✓</div>}
          </div>

          <p className="text-xs font-bold text-muted-foreground mt-1">
            {badgeDef.description}
          </p>

          <p className="text-xs font-bold text-muted mt-2 mb-2">
            {badgeDef.requirement}
          </p>

          {/* Progress Bar */}
          {!progress.earned && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                  style={{ width: `${Math.min(100, (progress.progress / progress.max) * 100)}%` }}
                />
              </div>
              <div className="text-xs font-bold text-muted min-w-fit">
                {progress.progress}/{progress.max}
              </div>
            </div>
          )}

          {/* Message */}
          <p className={`text-xs font-bold mt-2 ${
            progress.earned ? "text-green-600" : "text-orange"
          }`}>
            {progress.message}
          </p>
        </div>
      </div>
    </div>
  );
}

