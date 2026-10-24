import { useProgress, cardsDone, CARDS_PER_STATE } from "@/lib/progress";
import { getState, stateSlug, INDIA_STATES } from "@/lib/states";
import { fxTap } from "@/lib/fx";
import { Link } from "@tanstack/react-router";
import { EMOJI } from "@/constants/emoji";
import { KidsButton } from "./KidsButton";

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
  const currentState =
    p.completed.length === 0
      ? getState("Andhra Pradesh") // Default to first state if none completed
      : (() => {
          // Find the current state in progress
          const current = INDIA_STATES.find((s: Record<string, unknown>) => {
            const cardCount = p.cards?.[s.name as string]?.length ?? 0;
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
      return `${EMOJI.feedback.success} Goal met! You're amazing!`;
    }
    if (goalProgress === 0) {
      return `${EMOJI.goal.start} Complete ${dailyGoal} state${dailyGoal > 1 ? "s" : ""} today!`;
    }
    const remaining = dailyGoal - goalProgress;
    return `${remaining} more state${remaining > 1 ? "s" : ""} to go! You got this! ${EMOJI.feedback.encouragement}`;
  };

  return (
    <div
      className="flex-shrink-0"
      style={{ marginTop: "var(--space-2)", marginBottom: "var(--space-2)" }}
    >
      <div
        className={`rounded-2xl ${goalColor} shadow-lg relative overflow-hidden`}
        style={{ padding: "var(--padding-md)" }}
      >
        {/* Decorative background element */}
        <div
          className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: "var(--accent-1-soft)" }}
        />

        <div
          className="relative z-10 flex items-center justify-between"
          style={{ gap: "var(--gap-base)" }}
        >
          {/* Left: Goal info (compact) */}
          <div className="flex-1 min-w-0">
            <div className="text-caption" style={{ color: "var(--accent-1-ink)" }}>
              {goalLabel}
            </div>
            <div className="text-body-sm leading-tight" style={{ color: "var(--accent-1-ink)" }}>
              {dailyGoal} State{dailyGoal > 1 ? "s" : ""} Today
            </div>
            <div
              className="text-caption"
              style={{ color: "var(--accent-1-ink)", marginTop: "var(--space-0-5)", opacity: 0.9 }}
            >
              {getEncouragementMessage()}
            </div>
          </div>

          {/* Middle: Progress indicator */}
          <div className="flex-shrink-0">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--accent-1-soft)" }}
            >
              <div className="text-2xl">{goalMet ? EMOJI.goal.met : EMOJI.goal.progress}</div>
            </div>
          </div>

          {/* Right: CTA or status */}
          <div className="flex-shrink-0">
            {!goalMet && (
              <Link
                to="/state/$slug/learn"
                params={{ slug: stateSlug(currentState.name) }}
                onClick={() => fxTap()}
              >
                <KidsButton variant="primary" size="md">
                  Play →
                </KidsButton>
              </Link>
            )}
            {goalMet && (
              <div
                className="h-12 rounded-full border text-label font-bold flex items-center justify-center"
                style={{
                  paddingLeft: "var(--padding-base)",
                  paddingRight: "var(--padding-base)",
                  backgroundColor: "var(--accent-1-soft)",
                  borderColor: "var(--accent-1-ink)",
                  color: "var(--accent-1-ink)",
                }}
              >
                ✓ Done
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
