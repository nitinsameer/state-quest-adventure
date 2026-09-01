import { useProgress, levelInfo, badgeCount, resetProgress, unlockedCount, cardsDone, CARDS_PER_STATE } from "@/lib/progress";
import { INDIA_STATES, TOTAL_STATES } from "@/lib/states";
import { useGoBack, BottomNav } from "@/components/screens";
import { fxTap } from "@/lib/fx";
import { useState } from "react";

export function ParentZoneScreen() {
  const p = useProgress();
  const goBack = useGoBack("/me");
  const { level, pct } = levelInfo(p.xp);
  const [confirm, setConfirm] = useState(false);
  const unlocked = unlockedCount(p);
  const inProgress = INDIA_STATES.filter(
    (s) => !p.completed.includes(s.name) && cardsDone(p, s.name) > 0,
  );

  const stats = [
    { icon: "🗺️", label: "Places completed", value: `${p.completed.length}/${TOTAL_STATES}` },
    { icon: "⭐", label: "Total XP", value: p.xp.toLocaleString() },
    { icon: "🏅", label: "Badges earned", value: String(badgeCount(p)) },
    { icon: "📓", label: "Passport stamps", value: String(Object.keys(p.stamps).length) },
    { icon: "🔥", label: "Day streak", value: String(p.streak) },
    { icon: "🏆", label: "Achievements", value: String(unlocked) },
  ];

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-auto">
      <div className="px-5 pt-3 pb-6 gradient-explorer rounded-b-[32px] text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-xl"
          >
            ‹
          </button>
          <h1 className="text-display text-lg font-extrabold">Parent Zone</h1>
          <div className="w-10" />
        </div>
        <div className="mt-4 rounded-2xl bg-white/15 p-4">
          <div className="text-xs font-bold opacity-90">Learner</div>
          <div className="text-display text-2xl font-extrabold">
            {p.avatar} {p.name}
          </div>
          <div className="text-xs font-bold opacity-90 mt-1">
            Age {p.ageBand} · Level {level} · {pct}% to next level
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-4 shadow-soft border border-black/5">
            <div className="text-2xl">{s.icon}</div>
            <div className="text-display text-xl font-extrabold mt-1">{s.value}</div>
            <div className="text-[11px] font-bold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-5 mt-5">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          Currently learning
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5 space-y-3">
          {inProgress.length === 0 ? (
            <div className="text-sm font-semibold text-muted-foreground">
              No lessons in progress right now.
            </div>
          ) : (
            inProgress.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <div className="text-display font-extrabold text-sm">{s.name}</div>
                  <div className="h-1.5 mt-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full gradient-explorer"
                      style={{ width: `${(cardsDone(p, s.name) / CARDS_PER_STATE) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-muted-foreground">
                  {cardsDone(p, s.name)}/{CARDS_PER_STATE}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          Data & privacy
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5">
          <p className="text-sm font-semibold text-muted-foreground">
            All progress is stored only on this device. No account, no ads, and nothing is uploaded.
          </p>
          {confirm ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  fxTap();
                  resetProgress();
                  setConfirm(false);
                }}
                className="flex-1 h-12 rounded-2xl bg-red-500 text-white text-display font-extrabold"
              >
                Yes, erase everything
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 h-12 rounded-2xl bg-muted text-display font-extrabold text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                fxTap();
                setConfirm(true);
              }}
              className="mt-3 w-full h-12 rounded-2xl bg-red-50 text-red-600 text-display font-extrabold"
            >
              Reset all progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
