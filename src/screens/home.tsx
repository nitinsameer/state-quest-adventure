import { Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cloud, BottomNav, getAvatarImage, getAvatarName } from "./shared";
import { useProgress, statesWithProgress, cardsDone, levelInfo, badgeCount, CARDS_PER_STATE, getNextAchievementBadge } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { useNavigate, Link } from "@tanstack/react-router";
import { appLogger } from "@/lib/logger";
import { FirstSessionTutorial } from "@/components/FirstSessionTutorial";
import { stateSlug } from "@/lib/states";

const HOME_TOTAL_STATES = 36;

export function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: string;
  label: string;
  tone: "orange" | "gold" | "green";
}) {
  const border = {
    orange: "border-saffron/25",
    gold: "border-[color:var(--gold)]/30",
    green: "border-success/25",
  }[tone];
  return (
    <div className={`rounded-2xl bg-white border ${border} p-3 shadow-soft`}>
      <div className="text-lg">{icon}</div>
      <div className="text-display text-xl font-extrabold leading-snug mt-1">
        {value}
      </div>
      <div className="text-xs font-bold text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/**
 * Premium stats card - minimal, impactful design
 */
export function StatCardEnhanced({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: string;
  label: string;
  tone: "orange" | "gold" | "green";
}) {
  const bgGradient = {
    orange: "bg-gradient-to-br from-saffron/20 to-orange-100/10",
    gold: "bg-gradient-to-br from-yellow-200/25 to-yellow-100/15",
    green: "bg-gradient-to-br from-success/20 to-emerald-100/10",
  }[tone];

  const borderColor = {
    orange: "border-saffron/30",
    gold: "border-yellow-300/40",
    green: "border-success/30",
  }[tone];

  const numberColor = {
    orange: "text-saffron",
    gold: "text-yellow-600",
    green: "text-success",
  }[tone];

  return (
    <div className={`rounded-2xl ${bgGradient} border ${borderColor} p-2 shadow-soft hover:shadow-md transition-all`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 pl-1">
          <div className="text-2xl flex-shrink-0">{icon}</div>
          <div className={`text-3xl font-black ${numberColor} leading-none`}>
            {value}
          </div>
        </div>
        
        <div className="text-xs font-bold text-muted-foreground px-1">
          {label}
        </div>
      </div>
    </div>
  );
}

export function MiniStateCard({
  name,
  img,
  locked,
}: {
  name: string;
  img: string;
  locked?: boolean;
  tone?: "orange" | "blue";
}) {
  return (
    <div className="relative rounded-3xl bg-white border border-black/5 shadow-soft p-3">
      <div
        className={`h-20 rounded-2xl flex items-center justify-center overflow-hidden ${
          locked ? "bg-muted" : "gradient-sky"
        }`}
      >
        <img
          src={img}
          alt=""
          className={`h-full object-contain ${locked ? "grayscale opacity-60" : ""}`}
        />
      </div>
      <div className="mt-2 text-display font-extrabold text-sm">{name}</div>
      <div className="text-[10px] font-bold text-muted-foreground">
        {locked ? "🔒 Locked" : "Unlocked"}
      </div>
    </div>
  );
}

export function StateDetailModal({
  stateName,
  states,
  onClose,
  onPlay,
}: {
  stateName: string;
  states: Array<{
    name: string;
    short: string;
    status: string;
    isUT: boolean;
  }>;
  onClose: () => void;
  onPlay: () => void;
}) {
  const state = states.find((s) => s.name === stateName);
  const stateData = INDIA_STATES.find((s) => s.name === stateName);
  if (!state || !stateData) return null;

  const isLocked = state.status === "locked";
  const isDone = state.status === "done";

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
        >
          ✕
        </button>

        {/* State Display */}
        <div className="flex flex-col items-center pt-2">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center text-5xl mb-4 ${
              isDone
                ? "gradient-saffron shadow-lg"
                : isLocked
                ? "bg-gradient-to-br from-gray-200 to-gray-300 opacity-60"
                : "gradient-saffron shadow-lg"
            }`}
          >
            {stateData.emoji}
          </div>

          <h2 className="text-display text-2xl font-extrabold text-ink">
            {stateName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {state.isUT ? "Union Territory" : "State"} • {stateData.capital}
          </p>
        </div>

        {/* Status Information */}
        {isLocked ? (
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
            <p className="text-display text-sm font-extrabold text-amber-900 mb-2">
              🔒 Locked
            </p>
            <p className="text-sm font-semibold text-amber-800">
              Complete the previous state to unlock this adventure!
            </p>
          </div>
        ) : isDone ? (
          <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
            <p className="text-display text-sm font-extrabold text-green-900 mb-2">
              ✓ Completed
            </p>
            <p className="text-sm font-semibold text-green-800">
              You've earned all badges for this state!
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-4">
            <p className="text-display text-sm font-extrabold text-blue-900 mb-2">
              ▶ In Progress
            </p>
            <p className="text-sm font-semibold text-blue-800">
              Complete 3 cards and take the quiz to unlock the next state!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-gray-100 text-display font-extrabold text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
          {!isLocked && (
            <button
              onClick={() => {
                fxTap();
                onPlay();
              }}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-saffron-400 to-saffron-500 text-display font-extrabold text-white shadow-lg hover:shadow-xl transition"
            >
              {isDone ? "📖 Review" : "▶ Play"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomeDashboardScreen() {
  const p = useProgress();
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [showLockedPreview, setShowLockedPreview] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("india-explorer:tutorial-seen:v1");
      return !seen;
    }
    return false;
  });

  if (!p.onboarded) {
    appLogger.warn('home_dashboard', 'User attempted to access home without onboarding', {});
    return <Navigate to="/welcome" replace />;
  }

  const { level, toNext, pct } = levelInfo(p.xp);
  const postcards = Object.keys(p.postcards).length;
  const journey = statesWithProgress(p);
  const current = journey.find((s) => s.status === "current") ?? journey[journey.length - 1];
  const currentDone = cardsDone(p, current.name);
  const upNext = journey.filter((s) => s.name !== current.name && s.status !== "done" && s.status !== "current").slice(0, 2);
  const nextBadge = getNextAchievementBadge(p);

  useEffect(() => {
    setTimeout(() => setStatsVisible(true), 100);
    setTimeout(() => setAnimateStats(true), 500);
  }, []);

  const handleTutorialClose = () => {
    fxTap();
    localStorage.setItem("india-explorer:tutorial-seen:v1", "true");
    setShowTutorial(false);
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">
      {/* Premium Orange Header */}
      <div className={`px-6 pt-4 pb-6 gradient-saffron rounded-b-[32px] relative overflow-hidden transition-opacity duration-500 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        
        {/* Header: Avatar + Greeting + Streak + Help */}
        <div className="flex items-center gap-3 relative mb-4">
          <div className="h-16 w-16 rounded-2xl bg-white p-1 shadow-soft flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-white">
              <div className="text-display text-xl font-extrabold leading-tight">
                Namaste, {(p?.name?.split(" ")[0] || "Explorer")}! 🙏
              </div>
              <div className="text-xs font-semibold opacity-90 mt-0.5">Level {level} • Explorer</div>
            </div>
          </div>
          
          {/* Flame Badge + Help Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 bg-white rounded-full px-2.5 py-1.5 shadow-md">
              <span className="text-base">🔥</span>
              <span className="text-white text-display font-black text-sm">{p.streak}</span>
            </div>
            
            <button
              onClick={() => {
                fxTap();
                setShowTutorial(true);
              }}
              className="h-10 w-10 rounded-full bg-white/95 flex items-center justify-center text-saffron font-extrabold text-lg hover:bg-white active:scale-95 transition-all shadow-md"
              title="How to play"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className={`px-5 mt-4 relative z-10 grid grid-cols-3 gap-2 transition-all duration-700 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <StatCardEnhanced 
          tone="orange" 
          icon="🗺️" 
          value={String(p.completed.length)} 
          label="States"
        />
        <StatCardEnhanced 
          tone="gold" 
          icon="🏆" 
          value={String(badgeCount(p))} 
          label="Badges"
        />
        <StatCardEnhanced 
          tone="green" 
          icon="🎫" 
          value={String(postcards)} 
          label="Stamps"
        />
      </div>

      {/* Beginner Path Engagement CTA - Blue Gradient */}
      <div className="px-5 mt-4 flex-shrink-0">
        <Link
          to="/state/$slug/learn"
          params={{ slug: stateSlug(current.name) }}
          onClick={() => fxTap()}
          className="block rounded-3xl bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 shadow-md hover:shadow-lg transition-all active:scale-95 relative overflow-hidden"
        >
          <div className="absolute top-1 right-3 text-3xl opacity-30">🎯</div>
          <div className="relative z-10">
            <div className="text-xs font-bold opacity-95">Beginner Path</div>
            <div className="text-display font-black text-lg">1 State Today</div>
            <div className="text-xs opacity-90 mt-1 flex items-center gap-1">
              🎓 <span>Complete 1 state today!</span>
            </div>
            <button className="mt-2 bg-white text-blue-600 px-3 py-1.5 rounded-full text-display font-bold text-xs hover:bg-blue-50 transition-colors">
              Play →
            </button>
          </div>
        </Link>
      </div>

      {/* Next Achievement Card */}
      {nextBadge && (
        <div className="px-5 mt-4 flex-shrink-0">
          <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{nextBadge.icon || "🎖️"}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  NEXT ACHIEVEMENT
                </div>
                <div className="text-display font-bold text-base leading-tight mt-1">
                  {nextBadge.name}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 transition-all duration-500"
                    style={{ width: "45%" }}
                  />
                </div>
                <div className="text-xs font-semibold text-muted-foreground mt-1">
                  1 step away
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Your Journey */}
      <div className="px-5 mt-4 flex-shrink-0">
        <div className="text-display font-bold text-xs text-muted-foreground">
          Continue your journey
        </div>
        <div className="mt-2 rounded-3xl bg-white p-3 shadow-soft border border-black/5 flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl gradient-saffron p-1.5 flex items-center justify-center text-2xl animate-bounce flex-shrink-0">
            {current.emoji}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-saffron">
              Currently Exploring
            </div>
            <div className="text-display text-base font-bold leading-tight">
              {current.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full gradient-saffron transition-all duration-500"
                  style={{ width: `${(currentDone / CARDS_PER_STATE) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {currentDone}/{CARDS_PER_STATE}
              </span>
            </div>
          </div>
          <Link
            to="/state/$slug/learn"
            params={{ slug: stateSlug(current.name) }}
            onClick={() => fxTap()}
            className="h-10 px-2.5 rounded-2xl gradient-saffron text-white text-display font-bold text-xs shadow-md flex items-center justify-center transition-all active:scale-95"
          >
            Play ▶
          </Link>
        </div>
      </div>

      {/* Up Next States */}
      <div className="px-5 mt-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-display font-bold text-xs text-muted-foreground">
            Up next
          </div>
          <Link to="/journey" className="text-xs font-extrabold text-explorer hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {upNext.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => {
                fxTap();
                setShowLockedPreview(s.name);
              }}
              className={`rounded-3xl bg-white p-3 shadow-soft border border-black/5 flex flex-col items-center gap-1.5 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="text-2xl">{s.emoji}</div>
              <div className="text-display font-bold text-xs text-center leading-tight line-clamp-2">
                {s.name}
              </div>
              <div className="text-xs font-bold text-success">
                ☀️ Open
              </div>
            </button>
          ))}
        </div>
      </div>

      {showLockedPreview && (
        <StateDetailModal
          stateName={showLockedPreview}
          states={journey.map(s => ({ name: s.name, short: s.short, status: s.status, isUT: s.kind === "ut" }))}
          onClose={() => setShowLockedPreview(null)}
          onPlay={() => {
            setShowLockedPreview(null);
            navigate({ to: `/state/${stateSlug(showLockedPreview)}/learn` });
          }}
        />
      )}

      <FirstSessionTutorial 
        isVisible={showTutorial}
        onComplete={handleTutorialClose}
      />

      <BottomNav active="home" />
    </div>
  );
}
