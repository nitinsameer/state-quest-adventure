import { useMemo, useState } from "react";
import { useProgress } from "@/lib/progress";
import { REGIONS, REGION_KEYS, type RegionKey } from "@/lib/passport-helpers";
import { EMOJI } from "@/constants/emoji";
import { STATE_ART } from "@/lib/state-art";

/**
 * JourneyPassport: Visual collection of completed states as achievement badges.
 *
 * Displays:
 * - Grid of state cards (completed = full color, uncompleted = grayed)
 * - Each card shows: state name, badge icon, star count, completion date
 * - Progress bar: "X of 36 states collected"
 * - Filter by region using tabs
 * - Region master badges (if region is 100% complete)
 */

type RegionStat = {
  completed: number;
  total: number;
  isComplete: boolean;
};

function buildRegionStats(completedStates: Set<string>): Record<RegionKey, RegionStat> {
  const stats = {} as Record<RegionKey, RegionStat>;

  REGION_KEYS.forEach((regionKey: RegionKey) => {
    const region = REGIONS[regionKey];
    const regionStateNames = region.states.map((s: any) => s.name);
    const regionCompleted = regionStateNames.filter((name: string) => completedStates.has(name)).length;
    const regionTotal = regionStateNames.length;

    stats[regionKey] = {
      completed: regionCompleted,
      total: regionTotal,
      isComplete: regionCompleted === regionTotal && regionTotal > 0,
    };
  });

  return stats;
}

export function JourneyPassport() {
  const progress = useProgress();
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);

  const allStates = useMemo(
    () =>
      Object.values(REGIONS)
        .flatMap((r: any) => r.states)
        .sort((a: any, b: any) => a.name.localeCompare(b.name)),
    [],
  );

  const completedStates = useMemo(() => new Set(progress.completed || []), [progress.completed]);

  const passportBadges = useMemo(() => progress.postcards || {}, [progress.postcards]);

  const statesCount = 36;
  const collectedCount = completedStates.size;

  // Build region stats
  const regionStats = useMemo(() => buildRegionStats(completedStates), [completedStates]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-ink">Your Journey Passport</h2>
        <p className="text-body text-ink/70">
          Collect badges from every state and union territory you explore.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="ui-card ui-accent-1-soft p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-ink">Passport Collection</div>
          <div className="text-lg font-display font-bold text-accent-1">
            {collectedCount}/{statesCount}
          </div>
        </div>
        <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-1 rounded-full transition-all duration-500"
            style={{ width: `${(collectedCount / statesCount) * 100}%` }}
          />
        </div>
        <div className="text-xs font-semibold text-ink/60">
          {statesCount - collectedCount} states to explore
        </div>
      </div>

      {/* Region Tabs */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-ink">Regions</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {REGION_KEYS.map((regionKey: RegionKey) => {
            const region = REGIONS[regionKey];
            const stats = regionStats[regionKey];

            return (
              <button
                key={regionKey}
                onClick={() => setSelectedRegion(regionKey)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${
                  selectedRegion === regionKey
                    ? "ui-card ui-accent-1 border-2 border-accent-1"
                    : "ui-card ui-accent-1-soft"
                }`}
              >
                <div className="text-xl mb-1">{region.emoji}</div>
                <div className="text-xs font-bold text-ink leading-tight">
                  {region.name.split(" ")[0]}
                </div>
                <div className="text-xs font-semibold text-ink/70 mt-1">
                  {stats.completed}/{stats.total}
                </div>
                {stats.isComplete && <div className="text-sm mt-1">{EMOJI.feedback.trophy}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* States Grid */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-ink">States & Union Territories</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allStates.map((state) => {
            const isCompleted = completedStates.has(state.name);
            const badge = passportBadges[state.name];

            return (
              <button
                key={state.name}
                className={`p-3 rounded-2xl transition-all active:scale-95 text-left space-y-2 ${
                  isCompleted
                    ? "ui-card ui-accent-1-soft border-2 border-accent-1/30"
                    : "ui-card bg-ink/5 border-2 border-ink/10"
                }`}
                aria-label={`${state.name} ${isCompleted ? "collected" : "locked"}`}
              >
                {/* State Art or Icon */}
                <div className="h-16 w-full rounded-lg overflow-hidden bg-ink/10 flex items-center justify-center">
                  {isCompleted ? (
                    <img
                      src={STATE_ART[state.name]}
                      alt={state.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl">{EMOJI.action.lock}</div>
                  )}
                </div>

                {/* State Name */}
                <div>
                  <div
                    className={`text-xs font-bold uppercase tracking-wide ${
                      isCompleted ? "text-ink" : "text-ink/50"
                    }`}
                  >
                    {state.name}
                  </div>
                </div>

                {/* Badge and Stars */}
                {isCompleted && badge && (
                  <div className="flex items-center gap-2 pt-1 border-t border-ink/10">
                    <div className="text-sm">{EMOJI.feedback.trophy}</div>
                    <div className="text-xs font-bold text-ink/70">
                      {progress.stars?.[state.name] || "0"} {EMOJI.action.star}
                    </div>
                    {badge.stampDate && (
                      <div className="text-xs font-semibold text-ink/50 ml-auto">
                        {new Date(badge.stampDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Locked State Message */}
                {!isCompleted && <div className="text-xs font-semibold text-ink/50">Locked</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievement Milestone */}
      {collectedCount === statesCount && (
        <div className="ui-card ui-accent-3 p-5 rounded-2xl border-2 border-success/30 space-y-2 text-center">
          <div className="text-3xl">{EMOJI.milestone.hundred}</div>
          <div className="font-display font-bold text-ink">India Master!</div>
          <div className="text-xs text-ink/70">You've explored all 36 states and territories!</div>
        </div>
      )}
    </div>
  );
}
