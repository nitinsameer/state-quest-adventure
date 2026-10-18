import {
  useProgress,
  levelInfo,
  badgeCount,
  resetProgress,
  unlockedCount,
  cardsDone,
  CARDS_PER_STATE,
  getLevelName,
} from "@/lib/progress";
import { INDIA_STATES } from "@/lib/states";
import { STATE_ART } from "@/lib/state-art";
import { useGoBack, BottomNav } from "@/components/screens";
import { fxTap } from "@/lib/fx";
import { setPin } from "@/lib/parent-gate";
import { getParentZoneSettings, setParentZoneSetting } from "@/lib/parent-zone-settings";
import { EMOJI } from "@/constants/emoji";
import { useState } from "react";

// Local constant to avoid bundler issues
const TOTAL_STATES = 36;

export function ParentZoneScreen() {
  const p = useProgress();
  const goBack = useGoBack("/me");
  const { level, pct } = levelInfo(p.xp);
  const [confirm, setConfirm] = useState(false);
  const [showPINSettings, setShowPINSettings] = useState(false);
  const [newPIN, setNewPIN] = useState("");
  const [pinSaveStatus, setPinSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "controls" | "export">(
    "overview",
  );
  const [postcardNameSharing, setPostcardNameSharing] = useState(
    getParentZoneSettings().postcardNameSharing ?? false,
  );
  const unlocked = unlockedCount(p);
  const inProgress = INDIA_STATES.filter(
    (s) => !p.completed.includes(s.name) && cardsDone(p, s.name) > 0,
  );

  const stats = [
    {
      icon: EMOJI.nav.map,
      label: "Places completed",
      value: `${p.completed.length}/${TOTAL_STATES}`,
    },
    { icon: EMOJI.action.star, label: "Total XP", value: p.xp.toLocaleString() },
    { icon: EMOJI.nav.badges, label: "Badges earned", value: String(badgeCount(p)) },
    { icon: EMOJI.action.stamp, label: "Stamps collected", value: String(Object.keys(p.stamps).length) },
    { icon: EMOJI.action.fire, label: "Day streak", value: String(p.streak) },
    { icon: EMOJI.milestone.hundred, label: "Achievements", value: String(unlocked) },
  ];

  // Estimate screen time (rough calculation based on completed states)
  const estimatedHours = Math.round(
    (p.completed.length * 15 + cardsDone(p, p.completed[0] || "Andhra Pradesh") * 2) / 60,
  );

  // Calculate daily average
  const daysActive = p.streak || 1;
  const dailyAverage = Math.round(p.xp / daysActive / 100);

  const handleSavePIN = async () => {
    if (newPIN.length !== 4) {
      alert("PIN must be 4 digits");
      return;
    }

    setPinSaveStatus("saving");
    try {
      const success = await setPin(newPIN);
      if (success) {
        setPinSaveStatus("saved");
        setTimeout(() => {
          setShowPINSettings(false);
          setNewPIN("");
          setPinSaveStatus("idle");
        }, 1500);
      } else {
        alert("Failed to save PIN");
        setPinSaveStatus("idle");
      }
    } catch (e) {
      alert("Failed to save PIN");
      setPinSaveStatus("idle");
    }
  };

  const handleExportData = () => {
    // Create CSV export of progress
    const csv = [
      ["India Explorer - Progress Report"],
      [`Learner: ${p.name}`, `Age: ${p.ageBand}`, `Level: ${level} - ${getLevelName(level)}`],
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
      ...inProgress.map((s) => [
        s.name,
        cardsDone(p, s.name),
        Math.round((cardsDone(p, s.name) / CARDS_PER_STATE) * 100),
      ]),
      [""],
      ["COMPLETED STATES"],
      ["State"],
      ...p.completed.map((name) => [name]),
    ]
      .map((row) => row.join(","))
      .join("\n");

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
    <div className="h-full w-full bg-surface-raised flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-(--padding-base) pt-(--space-0-25) pb-(--space-2) gradient-explorer rounded-b-[32px]" style={{color: "var(--text-on-header)"}}>
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-text-on-header/25 flex items-center justify-center text-xl"
          >
            ‹
          </button>
          <h1 className="text-display text-lg font-extrabold">Parent Controls</h1>
          <div className="w-10" />
        </div>
        <div className="mt-(--space-0-25) rounded-2xl bg-text-on-header/15 p-(--padding-base)">
          <div className="text-xs font-bold opacity-90">Learner</div>
          <div className="text-display text-xl font-extrabold">
            {p.avatar} {p.name}
          </div>
          <div className="text-xs font-bold opacity-90 mt-(--space-0-25)">
            Age {p.ageBand} · Level {level}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 px-(--padding-base) pt-(--space-0-25) pb-0 border-b border-black/5 overflow-x-auto">
        {[
          { key: "overview", label: "Overview", icon: EMOJI.action.analytics },
          { key: "analytics", label: "Analytics", icon: EMOJI.action.growth },
          { key: "controls", label: "Controls", icon: EMOJI.action.gear },
          { key: "export", label: "Export", icon: EMOJI.action.save },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-(--padding-md) py-(--space-0-25) font-bold text-sm transition whitespace-nowrap border-b-2 ${
              activeTab === tab.key
                ? "text-action-primary-bg border-action-primary-bg"
                : "border-transparent hover:text-action-primary-bg"
            }`} style={activeTab !== tab.key ? {color: "var(--text-muted)"} : undefined}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-(--padding-base) flex-1 overflow-auto py-(--space-2)">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-(--space-2)">
            <div className="text-display font-extrabold text-sm uppercase" style={{color: "var(--text-muted)"}}>
              Quick Stats
            </div>
            <div className="grid grid-cols-2 gap-(--gap-base)">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-3xl bg-surface-card p-(--padding-base) shadow-[var(--shadow-card)] border border-black/5"
                >
                  <div className="text-2xl">{s.icon}</div>
                  <div className="text-display text-lg font-extrabold mt-(--space-0-25)">
                    {s.value}
                  </div>
                  <div className="text-xs font-bold leading-tight" style={{color: "var(--text-muted)"}}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-(--space-4)">
              <div className="text-display font-extrabold text-sm uppercase" style={{color: "var(--text-muted)"}}>
                Currently learning
              </div>
              <div className="mt-(--space-2) rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5 space-y-(--space-0-25)">
                {inProgress.length === 0 ? (
                  <div className="text-sm font-semibold" style={{color: "var(--text-muted)"}}>
                    No lessons in progress right now.
                  </div>
                ) : (
                  inProgress.map((s) => (
                    <div key={s.name} className="flex items-center gap-(--gap-base)">
                      <img
                        src={STATE_ART[s.name]}
                        alt={s.name}
                        className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex-1">
                        <div className="text-display font-extrabold text-sm">{s.name}</div>
                        <div className="h-1.5 mt-(--space-0-25) rounded-full bg-text-muted overflow-hidden">
                          <div
                            className="h-full gradient-explorer"
                            style={{ width: `${(cardsDone(p, s.name) / CARDS_PER_STATE) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold" style={{color: "var(--text-muted)"}}>
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
          <div className="space-y-(--space-2)">
            <div className="text-display font-extrabold text-sm uppercase" style={{color: "var(--text-muted)"}}>
              Engagement Metrics
            </div>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5 space-y-(--space-2)">
              <div>
                <div className="text-sm font-bold mb-(--space-0-25)" style={{color: "var(--text-muted)"}}>
                  Overall Progress
                </div>
                <div className="flex items-center gap-(--gap-base)">
                  <div className="flex-1 h-3 bg-progress-track rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-saffron"
                      style={{ width: `${(p.completed.length / TOTAL_STATES) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-action-primary-bg">
                    {p.completed.length}/{TOTAL_STATES}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold mb-(--space-0-25)" style={{color: "var(--text-muted)"}}>
                  Daily Average XP
                </div>
                <div className="text-display text-2xl font-extrabold text-action-primary-bg">
                  {dailyAverage * 100} XP/day
                </div>
              </div>

              <div>
                <div className="text-sm font-bold mb-(--space-0-25)" style={{color: "var(--text-muted)"}}>
                  Estimated Hours Played
                </div>
                <div className="text-display text-2xl font-extrabold text-fb-success-fg">
                  ~{estimatedHours}h
                </div>
              </div>

              <div>
                <div className="text-sm font-bold mb-(--space-0-25)" style={{color: "var(--text-muted)"}}>
                  Days Active
                </div>
                <div className="text-display text-2xl font-extrabold text-action-primary-fg">
                  {daysActive} days
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border-default)] p-(--padding-md)">
              <div className="text-sm font-bold mb-(--space-0-5)" style={{color: "var(--text-primary)"}}>
                💡 Insights
              </div>
              <div className="text-xs leading-relaxed" style={{color: "var(--text-secondary)"}}>
                {estimatedHours < 5
                  ? "Great balance! Your child is learning at a healthy pace."
                  : "Your child is very engaged! Consider encouraging breaks."}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS TAB */}
        {activeTab === "controls" && (
          <div className="space-y-(--space-2)">
            <div className="text-display font-extrabold text-sm text-muted-foreground uppercase">
              Parental Controls
            </div>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5">
              <div className="flex items-center justify-between mb-(--space-0-25)">
                <div>
                  <div className="text-sm font-bold" style={{color: "var(--text-primary)"}}>Parental PIN</div>
                  <div className="text-xs" style={{color: "var(--text-muted)"}}>Protect sensitive settings</div>
                </div>
                <button
                  onClick={() => setShowPINSettings(!showPINSettings)}
                  className="px-3 py-1 rounded-lg bg-action-primary-bg text-xs font-bold" style={{color: "var(--text-on-primary)"}}
                >
                  {showPINSettings ? "Hide" : "Edit"}
                </button>
              </div>

              {showPINSettings && (
                <div className="mt-(--space-0-25) space-y-(--space-0-5) border-t pt-(--space-0-25)">
                  <input
                    type="password"
                    maxLength={4}
                    value={newPIN}
                    onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-digit PIN"
                    className="w-full h-10 rounded-lg border-2 border-[var(--border-color)] px-3 font-extrabold text-center text-lg tracking-widest"
                  />
                  <button
                    onClick={handleSavePIN}
                    disabled={newPIN.length !== 4 || pinSaveStatus === "saving"}
                    className={`w-full h-10 rounded-lg font-bold text-sm transition ${
                      pinSaveStatus === "saved"
                        ? "bg-fb-success-bg disabled:opacity-50"
                        : "bg-action-primary-bg disabled:opacity-50"
                    }`} style={{color: "var(--text-on-primary)"}}
                  >
                    {pinSaveStatus === "saved"
                      ? "✓ Saved"
                      : pinSaveStatus === "saving"
                        ? "Saving..."
                        : "Save PIN"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: "var(--text-primary)"}}>Audio</div>
                  <div className="text-xs" style={{color: "var(--text-muted)"}}>Sound effects & narration</div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
              </div>
            </div>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: "var(--text-primary)"}}>File Storage</div>
                  <div className="text-xs" style={{color: "var(--text-muted)"}}>Save postcards</div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" disabled />
              </div>
            </div>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{color: "var(--text-primary)"}}>
                    Include child's name on shared postcards
                  </div>
                  <div className="text-xs" style={{color: "var(--text-muted)"}}>
                    When sharing, add child's name to image
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={postcardNameSharing}
                  onChange={(e) => {
                    fxTap();
                    const newValue = e.target.checked;
                    setPostcardNameSharing(newValue);
                    setParentZoneSetting("postcardNameSharing", newValue);
                  }}
                  className="h-5 w-5 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {activeTab === "export" && (
          <div className="space-y-(--space-2)">
            <div className="text-display font-extrabold text-sm uppercase" style={{color: "var(--text-muted)"}}>
              Data Export
            </div>

            <div className="rounded-3xl bg-info-soft border border-info p-(--padding-md)">
              <div className="text-sm font-bold mb-(--space-0-5)" style={{color: "var(--text-on-primary)"}}>
                📋 About Export
              </div>
              <div className="text-xs leading-relaxed" style={{color: "var(--text-on-primary)"}}>
                Download your child's progress as a CSV file. Useful for school reports or tracking
                learning over time.
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="w-full h-12 rounded-2xl bg-action-success-bg font-extrabold text-sm shadow-lg hover:shadow-xl active:scale-95 transition" style={{color: "var(--text-on-primary)"}}
            >
              {EMOJI.action.save} Download Progress Report
            </button>

            <div className="rounded-3xl bg-surface-card p-(--padding-md) shadow-soft border border-black/5 space-y-(--space-0-5)">
              <div className="text-sm font-bold" style={{color: "var(--text-primary)"}}>What's included:</div>
              <ul className="text-xs space-y-(--space-0-25)" style={{color: "var(--text-muted)"}}>
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
      <div className="px-(--padding-base) pb-(--space-2) border-t border-black/5 pt-(--space-2)">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider" style={{color: "var(--text-muted)"}}>
          Data & Privacy
        </div>
        <div className="mt-(--space-0-5) rounded-3xl bg-surface-card p-(--padding-md) shadow-[var(--shadow-card)] border border-black/5">
          <p className="text-sm font-semibold" style={{color: "var(--text-muted)"}}>
            All progress is stored only on this device. No account, no ads, and nothing is uploaded.
          </p>
          <a
            href="/privacy"
            className="inline-block mt-(--space-0-5) text-xs font-bold text-action-primary-bg hover:underline"
          >
            Read our Privacy Policy →
          </a>
          {confirm ? (
            <div className="mt-(--space-0-25) flex gap-(--gap-base)">
              <button
                onClick={() => {
                  fxTap();
                  resetProgress();
                  setConfirm(false);
                }}
                className="flex-1 h-12 rounded-2xl bg-fb-error-bg font-extrabold" style={{color: "var(--text-on-primary)"}}
              >
                Yes, erase everything
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 h-12 rounded-2xl bg-[var(--surface-muted)] text-display font-extrabold text-primary"
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
              className="mt-(--space-0-25) w-full h-12 rounded-2xl bg-[var(--fb-error-soft)] text-[var(--fb-error-fg)] text-display font-extrabold"
            >
              Reset all progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
