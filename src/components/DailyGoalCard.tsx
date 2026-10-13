import { useProgress, cardsDone, CARDS_PER_STATE } from "@/lib/progress";
import { getState, stateSlug, INDIA_STATES } from "@/lib/states";
import { fxTap } from "@/lib/fx";
import { Link } from "@tanstack/react-router";

/**
 * Daily Goal Card for HomeDashboardScreen
 * Shows personalized goal based on progress level
 * - Beginner (0-3 states): "Complete 1 state today"
 * - Intermediate (4-9 states): "Complete 2 states today"
 * - Advanced (10+ states): "Complete 3 states today"
 * 
 * Shows progress bar + encouragement + CTA to continue
 */
export function DailyGoalCard() {
  const p = useProgress();

  // Get current state being explored
  const currentState = p.completed.length === 0
    ? getState("Andhra Pradesh") // Default to first state if none completed
    : (() => {
        // Find the current state in progress
        const current = INDIA_STATES.find((s: any) => {
          const cardCount = p.cards?.[s.name]?.length ?? 0;
          return cardCount > 0 && cardCount < CARDS_PER_STATE;
        });
        return current || INDIA_STATES[0];
      })();

  // Determine goal level based on completed states
  const completedStates = p.completed.length;
  let dailyGoal: number;
  let goalLabel: string;
  let goalColor: string;

  if (completedStates < 4) {
    dailyGoal = 1;
    goalLabel = "Beginner Path";
    goalColor = "bg-accent-1";
  } else if (completedStates < 10) {
    dailyGoal = 2;
    goalLabel = "Intermediate Path";
    goalColor = "bg-accent-2";
  } else {
    dailyGoal = 3;
    goalLabel = "Advanced Path";
    goalColor = "bg-action-primary";
  }

  // Calculate progress toward today's goal
  // Track this via localStorage per day
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todayGoalKey = `india-explorer:daily-goal:${today}:v1`;
  const statesCompletedToday = (() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(todayGoalKey);
    return saved ? parseInt(saved, 10) : 0;
  })();

  const goalProgress = Math.min(statesCompletedToday, dailyGoal);
  const goalPercentage = (goalProgress / dailyGoal) * 100;
  const goalMet = goalProgress >= dailyGoal;

  // Encouragement messages
  const getEncouragementMessage = (): string => {
    if (goalMet) {
      return "🎉 Goal met! You're amazing!";
    }
    if (goalProgress === 0) {
      return `🚀 Complete ${dailyGoal} state${dailyGoal > 1 ? "s" : ""} today!`;
    }
    const remaining = dailyGoal - goalProgress;
    return `${remaining} more state${remaining > 1 ? "s" : ""} to go! You got this! 💪`;
  };

  return (
    <div className="mt-(--space-2) mb-(--space-2) flex-shrink-0">
      <div className={`rounded-2xl ${goalColor} p-(--padding-md) shadow-lg relative overflow-hidden`}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-(--gap-base)">
          {/* Left: Goal info (compact) */}
          <div className="flex-1 min-w-0">
            <div className="text-caption text-white/80">{goalLabel}</div>
            <div className="text-body-sm text-white leading-tight">
              {dailyGoal} State{dailyGoal > 1 ? "s" : ""} Today
            </div>
            <div className="text-caption text-white/90 mt-1">
              {getEncouragementMessage()}
            </div>
          </div>

          {/* Middle: Progress indicator */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <div className="text-2xl">{goalMet ? "🏆" : "🎯"}</div>
            </div>
          </div>

          {/* Right: CTA or status */}
          <div className="flex-shrink-0">
            {!goalMet && (
              <Link
                to="/state/$slug/learn"
                params={{ slug: stateSlug(currentState.name) }}
                onClick={() => fxTap()}
                className="h-10 px-(--padding-base) rounded-lg bg-white text-display font-extrabold text-xs shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Play →
              </Link>
            )}
            {goalMet && (
              <div className="h-10 px-(--padding-base) rounded-lg bg-white/20 border border-white text-white text-display font-extrabold text-xs flex items-center justify-center">
                ✓ Done
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
