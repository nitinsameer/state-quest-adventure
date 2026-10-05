import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProgress, type PostcardData } from "@/lib/progress";
import { getProgressPercentage } from "@/lib/passport-helpers";
import { INDIA_STATES } from "@/lib/states";
import { STATE_ART } from "@/lib/state-art";
import { generatePassportNumber } from "@/lib/passport-number";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { PostcardModal } from "@/components/PostcardModal";
import { fxTap } from "@/lib/fx";

/**
 * Passport for Ages 8-9 (Sapling)
 * Full 4x9 grid + engagement signals (streak, recently played, XP)
 */
export function PassportSapling() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [burst, setBurst] = useState(0);
  const [selectedPostcard, setSelectedPostcard] = useState<PostcardData | null>(null);

  const progressPct = getProgressPercentage(progress);
  const level = Math.floor(progress.xp / 400);
  const xpToNextLevel = Math.max(0, (level + 1) * 400 - progress.xp);
  const streak = progress.streak || 0; // Placeholder: would come from tracking

  const handleStateClick = (slug: string, isUnlocked: boolean) => {
    fxTap();
    // If state is completed, show postcard first (with celebration)
    if (isUnlocked) {
      const stateName = INDIA_STATES.find(s => s.name.toLowerCase().replace(/\s+/g, "-") === slug)?.name;
      if (stateName && progress.postcards[stateName]) {
        setSelectedPostcard(progress.postcards[stateName]);
        setBurst(b => b + 1);
        return;
      }
    }
    // Otherwise navigate to learn screen
    navigate({ to: "/state/$slug/learn", params: { slug } });
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-info-soft to-white flex flex-col overflow-hidden">
      <ConfettiBurst trigger={burst} size="big" />

      {/* Postcard Modal - shown on same screen */}
      {selectedPostcard && (
        <PostcardModal
          postcard={selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
        />
      )}

      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-b-3xl shadow-lg">
        <div className="text-2xl font-extrabold">My Passport 📖</div>
      </div>

      {/* Profile & Stats */}
      <div className="mx-5 mt-4 space-y-3">
        {/* Profile Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">{progress.avatar}</div>
            <div>
              <div className="text-lg font-extrabold">{progress.name}</div>
              <div className="text-xs opacity-75">Passport No: {generatePassportNumber(progress.avatar, progress.name)}</div>
            </div>
          </div>
          <div className="text-sm opacity-90 mt-2">
            India Progress: {progress.completed.length} of 36 ({progressPct}%)
          </div>
          <div className="text-sm opacity-90">
            Level {level} · {progress.xp} XP
          </div>
        </div>

        {/* Streak & Engagement */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md">
            <div className="text-2xl">🔥</div>
            <div className="text-xs font-extrabold mt-1">{streak}-day streak!</div>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md">
            <div className="text-2xl">⭐</div>
            <div className="text-xs font-extrabold mt-1">{xpToNextLevel} XP to next level</div>
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="px-5 pt-4 pb-2 flex-1 overflow-auto">
        <div className="text-sm font-bold text-muted mb-2">All 36 States</div>

        <div className="grid grid-cols-4 gap-2">
          {INDIA_STATES.map((state) => {
            const isUnlocked = progress.completed.includes(state.name);
            const slug = state.name.toLowerCase().replace(/\s+/g, "-");
            return (
              <button
                key={state.name}
                onClick={() => handleStateClick(slug, isUnlocked)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition transform text-xs font-bold ${
                  isUnlocked
                    ? "bg-gradient-to-br from-yellow-300 to-amber-400 text-warning shadow-md hover:shadow-lg active:scale-95"
                    : "bg-muted text-muted opacity-40 hover:opacity-60 active:scale-95"
                }`}
              >
                <img
                  src={STATE_ART[state.name]}
                  alt={state.name}
                  className="w-8 h-8 object-cover rounded"
                  loading="lazy"
                  decoding="async"
                />
                <div className="text-[9px] leading-tight">{state.short}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold shadow-lg"
        >
          Back Home 🏠
        </button>
      </div>
    </div>
  );
}

