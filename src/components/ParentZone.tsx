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
  const [showPINSettings, setShowPINSettings] = useState(false);
  const [newPIN, setNewPIN] = useState("");
  const [pinSaveStatus, setPinSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "controls" | "export">("overview");
  const unlocked = unlockedCount(p);
  const inProgress = INDIA_STATES.filter(
    (s) => !p.completed.includes(s.name) && cardsDone(p, s.name) > 0,
  );

  const stats = [
    { icon: "🗺️", label: "Places completed", value: `${p.completed.length}/${TOTAL_STATES}` },
    { icon: "⭐", label: "Total XP", value: p.xp.toLocaleString() },
    { icon: "🏅", label: "Badges earned", value: String(badgeCount(p)) },
    { icon: "🎫", label: "Stamps collected", value: String(Object.keys(p.stamps).length) },
    { icon: "🔥", label: "Day streak", value: String(p.streak) },
    { icon: "🏆", label: "Achievements", value: String(unlocked) },
  ];

  // Estimate screen time (rough calculation based on completed states)
  const estimatedHours = Math.round((p.completed.length * 15 + cardsDone(p, p.completed[0] || "Andhra Pradesh") * 2) / 60);
  
  // Calculate daily average
  const daysActive = p.streak || 1;
  const dailyAverage = Math.round((p.xp / daysActive) / 100);

  const handleSavePIN = () => {
    if (newPIN.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }
    
    setPinSaveStatus("saving");
    // Save PIN to localStorage (in production, would be encrypted)
    try {
      localStorage.setItem("india-explorer:parent-pin:v1", newPIN);
      setPinSaveStatus("saved");
      setTimeout(() => {
        setShowPINSettings(false);
        setNewPIN("");
        setPinSaveStatus("idle");
      }, 1500);
    } catch (e) {
      alert("Failed to save PIN");
      setPinSaveStatus("idle");
    }
  };

  const handleExportData = () => {
    // Create CSV export of progress
    const csv = [
      ["India Explorer - Progress Report"],
      [`Learner: ${p.name}`, `Age: ${p.ageBand}`, `Level: ${level}`],
      [""],
      ["SUMMARY STATS"],
      ["Metric", "Value"],
      ["States Completed", p.completed.length],
      ["Total XP", p.xp],
      ["Badges Earned", badgeCount(p)],
      ["Stamps Collected", Object.keys(p.stamps).length],
      ["Day Streak", p.streak],
      ["Estimated Hours Played", estimatedHours],
      [""],
      ["STATES IN PROGRESS"],
      ["State", "Cards Done", "Progress %"],
      ...inProgress.map(s => [
        s.name,
        cardsDone(p, s.name),
        Math.round((cardsDone(p, s.name) / CARDS_PER_STATE) * 100)
      ]),
      [""],
      ["COMPLETED STATES"],
      ["State"],
      ...p.completed.map(name => [name]),
    ].map(row => row.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `india-explorer-progress-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-3 pb-4 gradient-explorer rounded-b-[32px] text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-xl"
          >
            ‹
          </button>
          <h1 className="text-display text-lg font-extrabold">Parent Controls</h1>
          <div className="w-10" />
        </div>
        <div className="mt-3 rounded-2xl bg-white/15 p-3">
          <div className="text-xs font-bold opacity-90">Learner</div>
          <div className="text-display text-xl font-extrabold">
            {p.avatar} {p.name}
          </div>
          <div className="text-xs font-bold opacity-90 mt-1">
            Age {p.ageBand} · Level {level}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 px-5 pt-3 pb-0 border-b border-black/5 overflow-x-auto">
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          { key: "analytics", label: "Analytics", icon: "📈" },
          { key: "controls", label: "Controls", icon: "⚙️" },
          { key: "export", label: "Export", icon: "💾" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 font-bold text-sm transition whitespace-nowrap border-b-2 ${
              activeTab === tab.key
                ? "text-explorer border-explorer"
                : "text-muted-foreground border-transparent hover:text-explorer"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-5 flex-1 overflow-auto py-4">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
              Quick Stats
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl bg-white p-3 shadow-soft border border-black/5">
                  <div className="text-2xl">{s.icon}</div>
                  <div className="text-display text-lg font-extrabold mt-1">{s.value}</div>
                  <div className="text-[10px] font-bold text-muted-foreground leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
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
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
              Engagement Metrics
            </div>
            
            <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5 space-y-4">
              <div>
                <div className="text-sm font-bold text-muted-foreground mb-1">Overall Progress</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-saffron"
                      style={{ width: `${(p.completed.length / TOTAL_STATES) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-explorer">
                    {p.completed.length}/{TOTAL_STATES}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground mb-1">
                  Daily Average XP
                </div>
                <div className="text-display text-2xl font-extrabold text-explorer">
                  {dailyAverage * 100} XP/day
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground mb-1">
                  Estimated Hours Played
                </div>
                <div className="text-display text-2xl font-extrabold text-success">
                  ~{estimatedHours}h
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-muted-foreground mb-1">
                  Days Active
                </div>
                <div className="text-display text-2xl font-extrabold text-orange-500">
                  {daysActive} days
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-blue-50 border border-blue-200 p-4">
              <div className="text-sm font-bold text-blue-900 mb-2">💡 Insights</div>
              <div className="text-xs text-blue-800 leading-relaxed">
                {estimatedHours < 5 ? "Great balance! Your child is learning at a healthy pace." : "Your child is very engaged! Consider encouraging breaks."}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS TAB */}
        {activeTab === "controls" && (
          <div className="space-y-4">
            <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
              Parental Controls
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-bold text-ink">Parental PIN</div>
                  <div className="text-xs text-muted-foreground">Protect sensitive settings</div>
                </div>
                <button
                  onClick={() => setShowPINSettings(!showPINSettings)}
                  className="px-3 py-1 rounded-lg bg-explorer text-white text-xs font-bold"
                >
                  {showPINSettings ? "Hide" : "Edit"}
                </button>
              </div>

              {showPINSettings && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPIN}
                    onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-digit PIN"
                    className="w-full h-10 rounded-lg border-2 border-gray-300 px-3 font-extrabold text-center text-lg tracking-widest"
                  />
                  <button
                    onClick={handleSavePIN}
                    disabled={newPIN.length !== 4 || pinSaveStatus === "saving"}
                    className={`w-full h-10 rounded-lg font-bold text-sm transition ${
                      pinSaveStatus === "saved"
                        ? "bg-green-400 text-white"
                        : "bg-explorer text-white disabled:opacity-50"
                    }`}
                  >
                    {pinSaveStatus === "saved" ? "✓ Saved" : pinSaveStatus === "saving" ? "Saving..." : "Save PIN"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">Audio</div>
                  <div className="text-xs text-muted-foreground">Sound effects & narration</div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink">File Storage</div>
                  <div className="text-xs text-muted-foreground">Save postcards</div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
              </div>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === "export" && (
          <div className="space-y-4">
            <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
              Data Export
            </div>

            <div className="rounded-3xl bg-blue-50 border border-blue-200 p-4">
              <div className="text-sm font-bold text-blue-900 mb-2">📋 About Export</div>
              <div className="text-xs text-blue-800 leading-relaxed">
                Download your child's progress as a CSV file. Useful for school reports or tracking learning over time.
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-sm shadow-lg hover:shadow-xl active:scale-95 transition"
            >
              💾 Download Progress Report
            </button>

            <div className="rounded-3xl bg-white p-4 shadow-soft border border-black/5 space-y-2">
              <div className="text-sm font-bold text-ink">What's included:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Summary stats (XP, badges, states)</li>
                <li>✓ States in progress with completion %</li>
                <li>✓ All completed states list</li>
                <li>✓ Generated on {new Date().toLocaleDateString()}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Data & Privacy Section - Always visible */}
      <div className="px-5 pb-4 border-t border-black/5 pt-4">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          Data & Privacy
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5">
          <p className="text-sm font-semibold text-muted-foreground">
            All progress is stored only on this device. No account, no ads, and nothing is uploaded.
          </p>
          <a
            href="/privacy"
            className="inline-block mt-2 text-xs font-bold text-explorer hover:underline"
          >
            Read our Privacy Policy →
          </a>
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
