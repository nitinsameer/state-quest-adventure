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

type ViewMode = "grid" | "card" | "list";

export function StatePerformanceBadgesView() {
  const progress = useProgress();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const totalBadgesEarned = getTotalPerformanceBadgesEarned(progress.statePerformance);
  const totalPossible = INDIA_STATES.length * 6; // 6 performance badges per state

  const completedStates = INDIA_STATES.filter(s => progress.completed.includes(s.name));
  const lockedStates = INDIA_STATES.filter(s => !progress.completed.includes(s.name));

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-3 pb-4 gradient-explorer rounded-b-[32px] relative overflow-hidden">
        <div className="absolute top-2 right-4 text-5xl opacity-40 pointer-events-none">☁️</div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-white shadow-soft p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={getAvatarImage(progress.avatar)} alt={getAvatarName(progress.avatar)} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-white">
            <div className="text-display text-lg font-bold leading-tight">
              State Badges
            </div>
            <div className="text-xs font-bold text-white/80">Performance Collection</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 rounded-2xl bg-white/15 backdrop-blur p-4">
          <div className="flex items-center justify-between text-white gap-3">
            <div>
              <div className="text-xs font-bold opacity-90 uppercase tracking-wide">States Explored</div>
              <div className="text-display text-2xl font-extrabold mt-1">
                {completedStates.length}<span className="text-lg opacity-80 ml-1">/ 36</span>
              </div>
              <div className="text-xs font-bold opacity-90 mt-1">
                {totalBadgesEarned}/{totalPossible} Badges
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="text-xs font-extrabold opacity-90">Progress</div>
              <div className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-200 to-white rounded-full transition-all duration-500"
                  style={{ width: `${totalPossible > 0 ? (totalBadgesEarned / totalPossible) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <div className="text-4xl">🎖️</div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-5 pt-4 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            fxTap();
            setViewMode("grid");
          }}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm transition ${
            viewMode === "grid" ? "bg-white border-b-2 border-orange-400 text-orange-600" : "text-gray-600"
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => {
            fxTap();
            setViewMode("card");
          }}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm transition ${
            viewMode === "card" ? "bg-white border-b-2 border-orange-400 text-orange-600" : "text-gray-600"
          }`}
        >
          Card
        </button>
        <button
          onClick={() => {
            fxTap();
            setViewMode("list");
          }}
          className={`px-4 py-2 rounded-t-lg font-bold text-sm transition ${
            viewMode === "list" ? "bg-white border-b-2 border-orange-400 text-orange-600" : "text-gray-600"
          }`}
        >
          List
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4 space-y-6">
        {/* Completed States */}
        {completedStates.length > 0 && (
          <div>
            <h2 className="text-display font-extrabold text-lg mb-4 text-gray-900">
              ✓ Completed ({completedStates.length})
            </h2>
            
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 gap-3">
                {completedStates.map(state => (
                  <StateGridBadgeCard
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
            )}

            {viewMode === "card" && (
              <div className="space-y-4">
                {completedStates.map(state => (
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
            )}

            {viewMode === "list" && (
              <div className="space-y-2">
                {completedStates.map(state => (
                  <StateListBadgeRow
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
            )}
          </div>
        )}

        {/* Locked States */}
        {lockedStates.length > 0 && (
          <div>
            <h2 className="text-display font-extrabold text-lg mb-4 text-gray-900">
              🔒 Not Started ({lockedStates.length})
            </h2>
            
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 gap-3">
                {lockedStates.map(state => (
                  <div
                    key={state.name}
                    className="rounded-2xl p-3 flex flex-col items-center gap-2 border bg-gray-50 border-gray-200 opacity-70"
                  >
                    <div className="text-2xl">🔒</div>
                    <div className="text-display font-extrabold text-xs text-center leading-tight text-gray-600">
                      {state.name}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground">
                      0/9 Badges
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "card" && (
              <div className="space-y-4">
                {lockedStates.map(state => (
                  <div
                    key={state.name}
                    className="rounded-2xl p-4 bg-white shadow-soft border border-black/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🔒</div>
                      <div className="flex-1">
                        <h3 className="text-display font-extrabold text-gray-900">{state.name}</h3>
                        <p className="text-xs font-bold text-muted-foreground mt-1">Not yet started</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "list" && (
              <div className="space-y-2">
                {lockedStates.map(state => (
                  <div
                    key={state.name}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                  >
                    <span className="text-display font-extrabold text-sm min-w-[80px] text-gray-600">
                      {state.name}
                    </span>
                    <div className="text-2xl ml-auto">🔒</div>
                  </div>
                ))}
              </div>
            )}
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

/* ========== Grid View Component ========== */
function StateGridBadgeCard({ state, progress, onSelect }: any) {
  const earnedBadges = getPerformanceBadgesForState(progress.statePerformance, state.name);
  const totalBadges = 9;

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl p-4 flex flex-col items-center gap-3 border bg-white shadow-soft border-black/5 hover:shadow-md transition active:scale-95"
    >
      <div className="text-display font-extrabold text-sm text-center leading-tight text-gray-900">
        {state.name}
      </div>
      
      {/* Badge Icons Grid */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {earnedBadges.slice(0, 9).map((badge: StatePerformanceBadgeId) => (
          <div 
            key={badge}
            className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300 flex items-center justify-center text-base"
            title={STATE_PERFORMANCE_BADGE_DEFS[badge]?.name}
          >
            {getPerformanceBadgeIcon(badge)}
          </div>
        ))}
      </div>
      
      <div className="text-[10px] font-bold text-muted-foreground">
        {earnedBadges.length}/{totalBadges} Badges
      </div>
    </button>
  );
}

/* ========== Card View Component ========== */
function StateDetailBadgeCard({ state, progress, onSelect }: any) {
  const earnedBadges = getPerformanceBadgesForState(progress.statePerformance, state.name);
  const availableBadges = getAvailablePerformanceBadges(progress.statePerformance, state.name);
  const totalBadges = 9;

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl p-4 bg-white shadow-soft border border-black/5 text-left hover:shadow-md transition active:scale-[0.99]"
    >
      {/* State Name and Badge Count */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-display font-extrabold text-lg text-gray-900">{state.name}</h3>
          <div className="text-xs font-bold text-muted-foreground mt-1">
            {earnedBadges.length}/9 Badges
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
            style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-600 min-w-fit">
          {Math.round((earnedBadges.length / totalBadges) * 100)}%
        </span>
      </div>

      {/* All Badge Icons (Earned + Available) */}
      <div className="mt-3 flex gap-2 flex-wrap items-center">
        {/* Earned badges - colored */}
        {earnedBadges.map((badge: StatePerformanceBadgeId) => (
          <div 
            key={badge}
            className="h-7 w-7 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-300 flex items-center justify-center text-base flex-shrink-0"
            title={STATE_PERFORMANCE_BADGE_DEFS[badge]?.name}
          >
            {getPerformanceBadgeIcon(badge)}
          </div>
        ))}
        
        {/* Available badges - grayed out */}
        {availableBadges.slice(0, 3).map((badge: StatePerformanceBadgeId) => (
          <div 
            key={badge}
            className="h-7 w-7 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-base opacity-40 flex-shrink-0"
            title={`${STATE_PERFORMANCE_BADGE_DEFS[badge]?.name} - Not yet earned`}
          >
            {getPerformanceBadgeIcon(badge)}
          </div>
        ))}
      </div>

      {/* Action Text */}
      {earnedBadges.length < totalBadges && (
        <div className="mt-3 text-xs font-bold text-orange-600">
          {availableBadges.length} badges available • Replay to earn more
        </div>
      )}
    </button>
  );
}

/* ========== List View Component ========== */
function StateListBadgeRow({ state, progress, onSelect }: any) {
  const earnedBadges = getPerformanceBadgesForState(progress.statePerformance, state.name);
  const totalBadges = 9;

  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 transition active:scale-95 bg-white border border-black/5 shadow-soft"
    >
      {/* State Name */}
      <span className="text-display font-extrabold text-sm flex-shrink-0 text-gray-900 min-w-[120px]">
        {state.name}
      </span>
      
      {/* Badge Count */}
      <div className="text-xs font-bold text-muted-foreground min-w-fit">
        {earnedBadges.length}/{totalBadges}
      </div>
      
      {/* Lock Icon (for not started) */}
      <div className="ml-auto text-xl flex-shrink-0">
        🏆
      </div>
    </button>
  );
}
