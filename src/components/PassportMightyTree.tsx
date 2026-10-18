import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { getProgressPercentage, getMilestones, getXpToNextLevel } from "@/lib/passport-helpers";
import { INDIA_STATES } from "@/lib/states";
import { STATE_ART } from "@/lib/state-art";
import { generatePassportNumber } from "@/lib/passport-number";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PostcardModal } from "@/components/PostcardModal";
import { fxTap } from "@/lib/fx";
import { EMOJI } from "@/constants/emoji";

/**
 * My Stamps for Ages 10-12 (Mighty Tree)
 * Full data: stats, goals, milestones, activity tracking
 */
export function PassportMightyTree() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [burst, setBurst] = useState(0);
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);

  const progressPct = getProgressPercentage(progress);
  const level = Math.floor(progress.xp / 400);
  const xpToNextLevel = getXpToNextLevel(progress.xp);
  const streak = progress.streak || 0;
  const milestones = getMilestones(progress);

  const handleStateClick = (slug: string, isUnlocked: boolean) => {
    fxTap();
    // If state is completed, show postcard first (with celebration)
    if (isUnlocked) {
      const stateName = INDIA_STATES.find(
        (s) => s.name.toLowerCase().replace(/\s+/g, "-") === slug,
      )?.name;
      if (stateName && progress.postcards[stateName]) {
        setSelectedPostcard(progress.postcards[stateName]);
        setBurst((b) => b + 1);
        return;
      }
    }
    // Otherwise navigate to learn screen
    navigate({ to: "/state/$slug/learn", params: { slug } });
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Postcard Modal - shown on same screen */}
      {selectedPostcard && (
        <PostcardModal postcard={selectedPostcard} onClose={() => setSelectedPostcard(null)} />
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-bg-header rounded-b-3xl shadow-lg" style={{color: "var(--text-on-header)"}}>
        <div className="text-2xl font-extrabold">{`My Stamps ${EMOJI.action.stamp}`}</div>
      </div>

      {/* Profile & Detailed Stats */}
      <div className="mx-5 mt-4 space-y-3 overflow-y-auto flex-1">
        {/* Profile Card */}
        <div className="p-4 rounded-3xl bg-accent-1 shadow-lg sticky top-0" style={{color: "var(--text-on-primary)"}}>
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">{progress.avatar}</div>
            <div className="flex-1">
              <div className="text-lg font-extrabold">{progress.name}</div>
              <div className="text-xs opacity-75">
                Passport No: {generatePassportNumber(progress.avatar, progress.name)}
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm opacity-90 mt-3">
            <div>
              India Progress: {progress.completed.length} of 36 ({progressPct}%)
            </div>
            <div>
              Level {level} · {progress.xp} XP ({xpToNextLevel} to next level)
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">{EMOJI.action.fire}</span>
              <span>{streak}-day streak</span>
              <span className="text-xs">✓ Played today</span>
            </div>
          </div>
        </div>

        {/* Milestones/Goals */}
        <div className="space-y-2">
          <div className="px-1 text-sm font-bold" style={{color: "var(--text-secondary)"}}>
            {EMOJI.milestone.twentyFive} Milestones
          </div>
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="p-3 rounded-2xl bg-surface-card border-2 border-border-color shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-extrabold" style={{color: "var(--text-primary)"}}>{milestone.label}</span>
                <span className="text-xs font-bold" style={{color: "var(--text-secondary)"}}>
                  {milestone.current}/{milestone.target}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-sunken rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-3 transition-all duration-300"
                  style={{ width: `${milestone.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="space-y-2">
          <div className="px-1 text-sm font-bold" style={{color: "var(--text-secondary)"}}>📊 Activity</div>
          <div className="p-3 rounded-2xl bg-surface-card border-2 border-border-color shadow-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{color: "var(--text-secondary)"}}>This week:</span>
              <span className="font-extrabold" style={{color: "var(--text-primary)"}}>3 states</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{color: "var(--text-secondary)"}}>Last played:</span>
              <span className="font-extrabold" style={{color: "var(--text-primary)"}}>Yesterday</span>
            </div>
          </div>
        </div>

        {/* Recently Played */}
        <div className="space-y-2">
          <div className="px-1 text-sm font-bold text-text-secondary">⏱️ Recently Played</div>
          <div className="space-y-1">
            {progress.completed.slice(0, 3).map((stateName) => {
              const state = INDIA_STATES.find((s) => s.name === stateName);
              if (!state) return null;
              return (
                <button
                  key={stateName}
                  onClick={() =>
                    handleStateClick(stateName.toLowerCase().replace(/\s+/g, "-"), true)
                  }
                  className="w-full p-2 rounded-xl bg-accent-2-soft text-accent-2-ink text-sm font-semibold hover:shadow-md active:scale-95 transition text-left flex items-center gap-2"
                >
                  <img
                    src={STATE_ART[stateName]}
                    alt={stateName}
                    className="w-6 h-6 object-cover rounded"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{stateName}</span>
                  <span className="text-xs opacity-75 ml-auto">· 2d ago</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* States Grid */}
        <div className="space-y-2 pb-2">
          <div className="px-1 text-sm font-bold text-text-secondary">📍 All 36 States</div>
          <div className="grid grid-cols-4 gap-2">
            {INDIA_STATES.map((state) => {
              const isUnlocked = progress.completed.includes(state.name);
              const slug = state.name.toLowerCase().replace(/\s+/g, "-");
              return (
                <button
                  key={state.name}
                  onClick={() => handleStateClick(slug, isUnlocked)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition transform text-xs font-bold ${
                    isUnlocked
                      ? "bg-accent-4 text-accent-4-ink shadow-md hover:shadow-lg active:scale-95"
                      : "bg-surface-sunken text-text-secondary opacity-30 hover:opacity-50 active:scale-95"
                  }`}
                >
                  <img
                    src={STATE_ART[state.name]}
                    alt={state.name}
                    className="w-6 h-6 object-cover rounded"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="text-[8px] leading-tight text-center">{state.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="w-full h-12 rounded-2xl bg-accent-3 text-text-on-primary font-extrabold shadow-lg"
        >
          Back Home 🏠
        </button>
      </div>
    </div>
  );
}
