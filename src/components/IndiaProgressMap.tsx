import { useProgress } from "@/lib/progress";

/**
 * Simple animated India progress visualization
 * Shows progress with animated milestone bars
 */
export function IndiaProgressMap() {
  const p = useProgress();
  const completionPercentage = Math.round((p.completed.length / 36) * 100);

  const milestones = [
    { states: 5, label: "🌱 5 States", color: "bg-green-400" },
    { states: 10, label: "🌿 10 States", color: "bg-success-soft0" },
    { states: 15, label: "🌳 15 States", color: "bg-emerald-500" },
    { states: 20, label: "🏆 20 States", color: "bg-warning-soft0" },
    { states: 25, label: "💎 25 States", color: "bg-purple-soft0" },
    { states: 30, label: "👑 30 States", color: "bg-yellow-500" },
    { states: 36, label: "🎉 36 States - Master!", color: "bg-orange-soft0" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-[--padding-md]">
        <div className="flex items-center justify-between mb-[--space-0-5] gap-[--gap-base]">
          <h3 className="text-base font-bold flex-1">India Explored Map</h3>
          <span className="text-xs font-bold bg-white/30 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
            {p.completed.length}/36
          </span>
        </div>

        {/* Main progress bar - animated */}
        <div className="h-3 bg-white/25 rounded-full overflow-hidden mb-[--space-0-25]">
          <div
            className="h-full bg-white transition-all duration-1500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-xs font-semibold text-white">{completionPercentage}% Complete</div>
      </div>

      {/* Milestones Grid - Only show if user has started */}
      {p.completed.length > 0 && (
        <div className="p-[--padding-base] space-y-[--space-0-25] max-h-48 overflow-y-auto">
          {milestones.map((milestone, idx) => {
            const reached = p.completed.length >= milestone.states;
            const isNearby = Math.abs(p.completed.length - milestone.states) <= 1;

            return (
              <div key={idx} className="space-y-[--space-0-25]">
                <div className="flex items-center justify-between gap-[--gap-base]">
                  <span className={`text-xs font-bold flex-1 ${reached ? "text-muted-dark" : "text-muted-light"}`}>
                    {milestone.label}
                  </span>
                  <span className="text-xs font-bold text-muted flex-shrink-0">{milestone.states}/36</span>
                </div>

                {/* Milestone progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      reached ? milestone.color : "bg-muted"
                    } ${isNearby ? "shadow-lg" : ""}`}
                    style={{
                      width: `${Math.min(100, (p.completed.length / milestone.states) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational message */}
      <div className="px-[--padding-md] py-[--padding-base] bg-gradient-to-r from-orange-50 to-red-50 border-t border-muted">
        <p className="text-xs font-semibold text-center text-muted">
          {completionPercentage === 0
            ? "🚀 Start exploring to unlock milestones!"
            : completionPercentage === 100
              ? "👑 Congratulations! You're an India Master!"
              : completionPercentage >= 75
                ? "🏆 You're almost there! Just a few more states!"
                : completionPercentage >= 50
                  ? "🌳 Halfway there! Keep exploring!"
                  : "🌱 Great start! Keep the momentum going!"}
        </p>
      </div>
    </div>
  );
}

