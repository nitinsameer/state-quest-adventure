import { useProgress } from "@/lib/progress";
import { useNavigate } from "@tanstack/react-router";
import { fxTap } from "@/lib/fx";

/**
 * India Journey Meta-Game Progress Card
 * 
 * Features:
 * - Prominent white card showcasing milestone progression
 * - Progress visualization with dots (one per milestone)
 * - Motivational messages at different completion levels
 * - CTA button to start exploring
 * - Tappable to view full milestone details
 */
export function IndiaProgressMap() {
  const p = useProgress();
  const navigate = useNavigate();
  const completionPercentage = Math.round((p.completed.length / 36) * 100);

  const milestones = [
    { states: 5, emoji: "🌱", label: "5 States" },
    { states: 10, emoji: "🌿", label: "10 States" },
    { states: 15, emoji: "🌳", label: "15 States" },
    { states: 20, emoji: "🏆", label: "20 States" },
    { states: 25, emoji: "💎", label: "25 States" },
    { states: 30, emoji: "👑", label: "30 States" },
    { states: 36, emoji: "🎉", label: "36 States" },
  ];

  const handleStartExploring = () => {
    fxTap();
    navigate({ to: "/journey" });
  };

  const getMotivationalMessage = () => {
    if (completionPercentage === 0) {
      return "🚀 Start exploring";
    } else if (completionPercentage === 100) {
      return "👑 Congratulations! You're an India Master!";
    } else if (completionPercentage >= 75) {
      return "🏆 You're almost there! Just a few more states!";
    } else if (completionPercentage >= 50) {
      return "🌳 Halfway there! Keep exploring!";
    } else {
      return "🌱 Great start! Keep the momentum going!";
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-soft border border-black/5 overflow-hidden">
      {/* Main card content */}
      <div className="p-5">
        {/* Title row with flag and count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div>
              <h3 className="text-base font-black text-text-primary">India Journey</h3>
              <p className="text-xs text-text-secondary font-semibold">{p.completed.length} / 36 states explored</p>
            </div>
          </div>
          <button
            onClick={handleStartExploring}
            className="flex items-center gap-1.5 bg-accent-1-soft hover:bg-accent-1-soft/80 text-accent-1 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95"
          >
            <span>🚀</span>
            <span>Start exploring!</span>
          </button>
        </div>

        {/* Main progress bar */}
        <div className="mb-4">
          <div className="h-2.5 bg-surface-sunken rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-1 transition-all duration-1500 ease-out rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Milestone dots row */}
        <div className="flex items-end justify-between gap-1 mb-4">
          {milestones.map((milestone, idx) => {
            const reached = p.completed.length >= milestone.states;
            const isNearby = Math.abs(p.completed.length - milestone.states) <= 1;
            const progressPct = Math.min(100, (p.completed.length / milestone.states) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                {/* Milestone dot */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    reached
                      ? "bg-action-primary text-white shadow-md"
                      : isNearby
                        ? "bg-surface-sunken text-text-secondary shadow-lg"
                        : "bg-surface-sunken text-text-muted"
                  }`}
                  style={{
                    transform: isNearby && !reached ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {milestone.emoji}
                </div>
                {/* Label */}
                <span className="text-xs font-bold text-text-secondary text-center">{milestone.label}</span>
              </div>
            );
          })}
        </div>

        {/* Motivational message */}
        <div className="text-center">
          <p className="text-sm font-semibold text-text-primary">{getMotivationalMessage()}</p>
        </div>
      </div>
    </div>
  );
}

