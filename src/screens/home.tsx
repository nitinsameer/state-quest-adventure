import { Navigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, ReactNode } from "react";
import { Cloud, BottomNav, HeaderBar, XPBar, Chip, useGoBack, AVATAR_IMAGE_MAP, getAvatarImage, getAvatarName } from "./shared";
import { useProgress, statesWithProgress, cardsDone, levelInfo, badgeCount, addXP, CARDS_PER_STATE, XP_PER_CARD, getRecentlyCompletedState, clearRecentlyCompleted, getStreakStatus, getStreakMilestone, getNextAchievementBadge, getPostcardsArray, getTotalStampCount } from "@/lib/progress";
import { fxTap, fxCorrect, fxWrong, fxConfetti } from "@/lib/fx";
import { useNavigate, Link } from "@tanstack/react-router";
import { useCelebration } from "@/hooks/useCelebration";
import { appLogger } from "@/lib/logger";
import { FirstSessionTutorial } from "@/components/FirstSessionTutorial";
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { INDIA_STATES, stateSlug } from "@/lib/states";
import { TOTAL_STATES } from "@/lib/states";

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
  const [dismissStreakWarning, setDismissStreakWarning] = useState(false);
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

  const celebration = useCelebration();

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
      <div className={`px-6 pt-4 pb-4 gradient-saffron rounded-b-[32px] relative overflow-hidden transition-opacity duration-500 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        <div className="flex items-center gap-4 relative mb-3">
          <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-soft flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-white">
              <div className="text-display text-xl font-extrabold leading-tight">
                Namaste, {(p?.name?.split(" ")[0] || "Explorer")}! 🙏
              </div>
              <div className="text-xs font-semibold opacity-95 mt-1">Level {level} • Explorer</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 bg-white/70 rounded-full px-3 py-2 backdrop-blur transition-transform duration-1000 ${p.streak > 0 ? "animate-bounce" : ""}`}>
              <span className="text-lg">🔥</span>
              <span className="text-white text-display font-black">{p.streak}</span>
            </div>
            
            <button
              onClick={() => {
                fxTap();
                setShowTutorial(true);
              }}
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-saffron font-extrabold text-lg hover:bg-white active:scale-95 transition-all shadow-lg hover:shadow-xl"
              title="How to play"
            >
              ?
            </button>
          </div>
        </div>

        <div className={`rounded-2xl bg-white/15 backdrop-blur p-4 relative transition-all duration-700 ${statsVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-xs font-bold opacity-90">XP Progress</div>
              <div className="text-display text-2xl font-extrabold">
                {p.xp.toLocaleString()} XP
              </div>
            </div>
            <div className="text-right text-xs font-bold opacity-90">
              {toNext} to
              <br />
              Lv {level + 1}
            </div>
          </div>
          <div className="mt-2">
            <XPBar value={pct} />
          </div>
        </div>

        <div className={`mt-3 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 relative overflow-hidden transition-all duration-700 ${statsVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          <div className="absolute top-1 right-2 text-3xl opacity-20">🌏🗺️</div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🗺️</span>
                <div>
                  <div className="text-xs font-bold opacity-90">India Explored</div>
                  <div className="text-display text-2xl font-extrabold">{Math.round((p.completed.length / HOME_TOTAL_STATES) * 100)}%</div>
                </div>
              </div>
              <div className="text-right text-xs font-bold opacity-90">
                {p.completed.length}/{HOME_TOTAL_STATES}<br/>States
              </div>
            </div>
            <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${(p.completed.length / HOME_TOTAL_STATES) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`px-6 mt-3 relative z-10 grid grid-cols-3 gap-2 transition-all duration-700 ${animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
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

      <DailyGoalCard />

      <div className="px-5 mt-4 mb-4 flex-shrink-0">
        <div className="text-display font-bold text-sm text-muted-foreground">
          Continue your journey
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5 flex items-center gap-3">
          <div className="h-16 w-16 rounded-2xl gradient-saffron p-2 flex items-center justify-center text-3xl animate-bounce">
            {current.emoji}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-saffron">
              {current.kind === "ut" ? "Union Territory" : "Currently Exploring"}
            </div>
            <div className="text-display text-lg font-bold leading-tight">
              {current.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
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
            className="h-11 px-3 rounded-2xl gradient-saffron text-white text-display font-bold text-sm shadow-[var(--shadow-glow-orange)] flex items-center transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
          >
            Play ▶
          </Link>
        </div>
      </div>

      <div className="px-5 mt-4 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-display font-bold text-sm text-muted-foreground">
            Up next
          </div>
          <Link to="/journey" className="text-xs font-extrabold text-explorer">
            View all
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {upNext.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => {
                fxTap();
                setShowLockedPreview(s.name);
              }}
              className={`rounded-3xl bg-white p-3 shadow-soft border border-black/5 flex flex-col items-center gap-1 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                animateStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="text-display font-bold text-sm text-center leading-tight line-clamp-2">
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
