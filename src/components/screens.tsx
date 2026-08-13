import mascot from "@/assets/mascot.png";
import airplane from "@/assets/airplane.png";
import rajasthan from "@/assets/rajasthan.png";
import gujarat from "@/assets/gujarat.png";
import maharashtra from "@/assets/maharashtra.png";
import mp from "@/assets/mp.png";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { fxCorrect, fxWrong, fxConfetti, fxStamp, fxTap, useSoundOn, setSoundOn } from "@/lib/fx";
import {
  INDIA_STATES,
  TOTAL_STATES,
  TOTAL_STATES_ONLY,
  TOTAL_UNION_TERRITORIES,
  getState,
  stateIndex,
  stateSlug,
  nextStateAfter,
} from "@/lib/states";
import { randomQuestionsForState } from "@/lib/quiz";

import {
  useProgress,
  saveProfile,
  addXP,
  completeState,
  resetProgress,
  levelInfo,
  statesWithProgress,
  badgeCount,
  badgesFor,
  STATE_BADGES,
  achievementsFor,
  markCard,
  touchStreak,
  cardsDone,
  cardsRead,
  CARDS_PER_STATE,
  XP_PER_CARD,
} from "@/lib/progress";


/* ---------- shared bits ---------- */

function Cloud({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className}>
      <g fill="#ffffff">
        <ellipse cx="30" cy="38" rx="24" ry="18" />
        <ellipse cx="58" cy="28" rx="28" ry="22" />
        <ellipse cx="88" cy="40" rx="22" ry="16" />
        <rect x="18" y="36" width="82" height="18" rx="9" />
      </g>
    </svg>
  );
}

function XPBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-3 w-full rounded-full bg-black/10 overflow-hidden">
      <div
        className="h-full rounded-full gradient-gold"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 h-1 rounded-full bg-white/70"
        style={{ width: `${pct * 0.9}%`, left: "5%" }}
      />
    </div>
  );
}

function Chip({
  icon,
  children,
  tone = "orange",
}: {
  icon: string;
  children: ReactNode;
  tone?: "orange" | "blue" | "green" | "gold";
}) {
  const map = {
    orange: "bg-saffron-soft text-saffron",
    blue: "bg-explorer-soft text-explorer",
    green: "bg-success-soft text-success",
    gold: "bg-gold-soft text-[color:var(--gold)]",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${map[tone]}`}
    >
      <span>{icon}</span>
      {children}
    </span>
  );
}

export function BottomNav({
  active,
}: {
  active: "home" | "map" | "passport" | "badges" | "profile";
}) {
  const items = [
    { id: "home", icon: "🏠", label: "Home", to: "/home" },
    { id: "map", icon: "🗺️", label: "Journey", to: "/journey" },
    { id: "passport", icon: "📓", label: "Passport", to: "/passport" },
    { id: "badges", icon: "🏅", label: "Badges", to: "/badges" },
    { id: "profile", icon: "👤", label: "Me", to: "/me" },
  ] as const;
  return (
    <div className="absolute bottom-0 inset-x-0 z-20">
      <div className="mx-3 mb-3 rounded-3xl bg-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)] border border-black/5 px-2 py-2 flex items-center justify-between">
        {items.map((i) => {
          const on = i.id === active;
          return (
            <Link
              key={i.id}
              to={i.to}
              onClick={() => fxTap()}
              aria-label={i.label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition active:scale-95 ${
                on ? "bg-saffron-soft" : ""
              }`}
            >
              <span className="text-lg leading-none">{i.icon}</span>
              <span
                className={`text-[10px] font-extrabold ${
                  on ? "text-saffron" : "text-muted-foreground"
                }`}
              >
                {i.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Goes back in history, falling back to Home when there is nothing to pop. */
export function useGoBack(fallback = "/home") {
  const router = useRouter();
  const navigate = useNavigate();
  return () => {
    fxTap();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      navigate({ to: fallback });
    }
  };
}

function HeaderBar({
  title,
  onBack = true,
  right,
  tone = "white",
}: {
  title: string;
  onBack?: boolean;
  right?: ReactNode;
  tone?: "white" | "transparent";
}) {
  const goBack = useGoBack();
  return (
    <div
      className={`flex items-center justify-between px-5 pt-3 pb-2 ${
        tone === "white" ? "bg-white" : ""
      }`}
    >
      {onBack ? (
        <button
          onClick={goBack}
          aria-label="Go back"
          className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ‹
        </button>
      ) : (
        <div className="w-10" />
      )}
      <h2 className="text-display text-lg font-extrabold">{title}</h2>
      <div className="w-10 flex justify-end">{right}</div>
    </div>
  );
}

/* ---------- SCREENS ---------- */

export function SplashScreen() {
  return (
    <div className="h-full w-full gradient-saffron relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute -top-10 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      <Cloud className="absolute top-16 left-4 w-24 opacity-80" />
      <Cloud className="absolute top-40 right-2 w-16 opacity-70" />
      <Cloud className="absolute bottom-40 left-6 w-20 opacity-60" />

      <img
        src={mascot}
        alt=""
        className="w-52 h-52 object-contain drop-shadow-2xl relative z-10"
      />
      <div className="mt-4 text-center relative z-10 px-8">
        <h1 className="text-display text-4xl font-extrabold text-white leading-none">
          India
          <br />
          Explorer
        </h1>
        <p className="mt-3 text-white/95 font-bold">
          Travel Across India,
          <br /> One State at a Time
        </p>
      </div>
      <div className="absolute bottom-20 flex items-center gap-2 text-white/90 text-sm font-bold">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        <span className="h-2 w-2 rounded-full bg-white/60" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="ml-2">Loading adventure…</span>
      </div>
    </div>
  );
}

export function WelcomeScreen() {
  return (
    <div className="h-full w-full gradient-sky relative flex flex-col">
      <Cloud className="absolute top-14 -left-4 w-28 opacity-90" />
      <Cloud className="absolute top-24 right-2 w-20 opacity-90" />
      <div className="flex-1 flex items-center justify-center pt-6">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-saffron/30 rounded-full" />
          <img src={mascot} alt="" className="relative w-64 h-64 object-contain drop-shadow-xl" />
        </div>
      </div>
      <div className="rounded-t-[36px] bg-white px-6 pt-8 pb-6 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.15)]">
        <h1 className="text-display text-3xl font-extrabold leading-tight">
          Namaste, little<br />explorer! 👋
        </h1>
        <p className="mt-3 text-muted-foreground font-semibold">
          Get ready for an epic journey across all {TOTAL_STATES_ONLY} states and{" "}
          {TOTAL_UNION_TERRITORIES} union territories of India. Collect stamps, earn
          badges, and become the ultimate Explorer!
        </p>
        <Link
          to="/create"
          onClick={() => fxTap()}
          className="mt-6 w-full h-14 rounded-2xl gradient-saffron text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)] flex items-center justify-center"
        >
          Start My Adventure ✈️
        </Link>
        <Link
          to="/home"
          onClick={() => fxTap()}
          className="mt-3 w-full h-12 rounded-2xl bg-explorer-soft text-explorer text-display font-extrabold flex items-center justify-center"
        >
          I already have progress
        </Link>
      </div>
    </div>
  );
}

export function CreateProfileScreen() {
  const avatars = ["🧒", "👧", "🧑‍🚀", "🧑‍🎤", "👦", "👩‍🦰"];
  const p = useProgress();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(p.avatar);
  const [name, setName] = useState(p.onboarded ? p.name : "");
  const [ageBand, setAgeBand] = useState(p.ageBand);
  const [saved, setSaved] = useState(false);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Create Explorer" />
      <div className="px-5 flex-1 overflow-auto">
        <div className="rounded-3xl gradient-explorer p-5 text-white relative overflow-hidden">
          <Cloud className="absolute -top-3 right-2 w-16 opacity-40" />
          <div className="text-xs font-black uppercase tracking-widest opacity-80">
            Step 1 of 2
          </div>
          <div className="text-display text-2xl font-extrabold mt-1">
            Pick your avatar
          </div>
          <div className="text-sm opacity-90 font-semibold">
            Choose the explorer who will travel with you
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {avatars.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                fxTap();
                setAvatar(a);
                setSaved(false);
              }}
              className={`aspect-square rounded-3xl flex items-center justify-center text-5xl border-4 transition ${
                a === avatar
                  ? "bg-saffron-soft border-saffron shadow-[var(--shadow-glow-orange)]"
                  : "bg-muted border-transparent"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label className="text-display text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
            Explorer name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            placeholder="Your name"
            className="mt-2 h-14 w-full rounded-2xl border-2 border-saffron bg-saffron-soft/40 px-4 text-display text-xl font-extrabold text-ink outline-none"
          />
        </div>

        <div className="mt-4">
          <label className="text-display text-sm font-extrabold text-muted-foreground uppercase tracking-wider">
            Age
          </label>
          <div className="mt-2 flex gap-2">
            {["6-7", "8-9", "10-12"].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  fxTap();
                  setAgeBand(a);
                  setSaved(false);
                }}
                className={`flex-1 h-12 rounded-2xl flex items-center justify-center text-display font-extrabold transition ${
                  a === ageBand
                    ? "gradient-explorer text-white shadow-[var(--shadow-glow-blue)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5">
        <button
          onClick={() => {
            fxTap();
            saveProfile({ name: name.trim() || "Explorer", avatar, ageBand });
            setSaved(true);
            navigate({ to: "/home" });
          }}
          className="w-full h-14 rounded-2xl gradient-saffron text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]"
        >
          {saved ? "Saved ✓" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

export function HomeDashboardScreen() {
  const p = useProgress();
  const { level, toNext, pct } = levelInfo(p.xp);
  const stamps = Object.keys(p.stamps).length;
  const journey = statesWithProgress(p);
  const current = journey.find((s) => s.status === "current") ?? journey[journey.length - 1];
  const currentDone = cardsDone(p, current.name);
  const upNext = journey.filter((s) => s.name !== current.name && s.status === "locked").slice(0, 2);

  useEffect(() => {
    touchStreak();
  }, []);

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-auto">

      {/* Header */}
      <div className="px-5 pt-3 pb-4 gradient-saffron rounded-b-[32px] relative overflow-hidden">
        <Cloud className="absolute top-2 right-4 w-14 opacity-40" />
        <div className="flex items-center gap-3 relative">
          <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-soft">
            <img src={mascot} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold opacity-90">Namaste,</div>
            <div className="text-display text-lg font-extrabold leading-tight">
              {p.name.split(" ")[0]}! 👋
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1.5 backdrop-blur">
            <span>🔥</span>
            <span className="text-white text-display font-extrabold">{p.streak}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/15 backdrop-blur p-3 relative">
          <div className="flex items-center justify-between text-white">
            <div>
              <div className="text-xs font-bold opacity-90">Level {level} · Explorer</div>
              <div className="text-display text-xl font-extrabold">
                {p.xp.toLocaleString()} XP
              </div>
            </div>
            <div className="text-right text-xs font-bold opacity-90">
              {toNext} XP to
              <br />
              Level {level + 1}
            </div>
          </div>
          <div className="mt-2">
            <XPBar value={pct} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-4 relative z-10 grid grid-cols-3 gap-2.5">
        <StatCard tone="orange" icon="🗺️" value={String(p.completed.length)} label="States" />
        <StatCard tone="gold" icon="🏅" value={String(badgeCount(p))} label="Badges" />
        <StatCard tone="green" icon="📓" value={String(stamps)} label="Stamps" />
      </div>

      {/* Continue journey */}
      <div className="px-5 mt-4">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          Continue your journey
        </div>
        <div className="mt-2 rounded-3xl bg-white p-4 shadow-soft border border-black/5 flex items-center gap-3">
          <div className="h-16 w-16 rounded-2xl gradient-saffron p-2 flex items-center justify-center text-4xl">
            {current.emoji}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-saffron">
              {current.kind === "ut" ? "Union territory" : "Currently exploring"}
            </div>
            <div className="text-display text-lg font-extrabold leading-tight">
              {current.name}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full gradient-saffron"
                  style={{ width: `${(currentDone / CARDS_PER_STATE) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-extrabold text-muted-foreground">
                {currentDone}/{CARDS_PER_STATE}
              </span>
            </div>
          </div>
          <Link
            to="/state/$slug/learn"
            params={{ slug: stateSlug(current.name) }}
            onClick={() => fxTap()}
            className="h-11 px-3 rounded-2xl gradient-saffron text-white text-display font-extrabold text-sm shadow-[var(--shadow-glow-orange)] flex items-center"
          >
            Play ▶
          </Link>
        </div>
      </div>

      {/* Up next */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
            Up next
          </div>
          <Link to="/journey" className="text-xs font-extrabold text-explorer">
            View all
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {upNext.map((s) => (
            <div
              key={s.name}
              className="rounded-3xl bg-white p-3 shadow-soft border border-black/5 flex flex-col items-center gap-1 opacity-80"
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="text-display font-extrabold text-sm text-center leading-tight">
                {s.name}
              </div>
              <div className="text-[10px] font-extrabold text-muted-foreground">🔒 Locked</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1" />
      <BottomNav active="home" />
      <div className="h-24" />
    </div>
  );
}

function StatCard({
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
      <div className="text-display text-xl font-extrabold leading-none mt-1">
        {value}
      </div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function MiniStateCard({
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

export function JourneyMapScreen() {
  const p = useProgress();
  const states = statesWithProgress(p);
  const [view, setView] = useState<{ screen: "intro" | "hub"; name: string } | null>(null);
  const STEP = 118;
  const BANNER_GAP = 96;

  // Two collectible routes: the 28 states, then the 8 union territories.
  const routes = [
    { key: "states", label: "Route 1 · States", icon: "🗺️", items: states.filter((s) => s.kind !== "ut") },
    { key: "ut", label: "Route 2 · Union Territories", icon: "🏝️", items: states.filter((s) => s.kind === "ut") },
  ];

  type MapNode = {
    name: string;
    short: string;
    status: (typeof states)[number]["status"];
    isUT: boolean;
    x: number;
    y: number;
  };
  const nodes: MapNode[] = [];
  const banners: { key: string; label: string; icon: string; y: number; done: number; total: number }[] = [];

  let y = 70;
  let idx = 0;
  for (const route of routes) {
    const done = route.items.filter((s) => s.status === "done").length;
    banners.push({ key: route.key, label: route.label, icon: route.icon, y, done, total: route.items.length });
    y += BANNER_GAP;
    for (const s of route.items) {
      nodes.push({
        name: s.name,
        short: s.short,
        status: s.status,
        isUT: s.kind === "ut",
        x: idx % 2 === 0 ? 26 : 72,
        y,
      });
      y += STEP;
      idx += 1;
    }
  }

  const height = y + 20;
  const currentIndex = nodes.findIndex((n) => n.status === "current");

  if (view?.screen === "intro") {
    return (
      <StateIntroScreen
        stateName={view.name}
        onBack={() => setView(null)}
        onContinue={() => setView({ screen: "hub", name: view.name })}
      />
    );
  }
  if (view?.screen === "hub") {
    return (
      <LearningHubScreen
        stateName={view.name}
        onBack={() => setView({ screen: "intro", name: view.name })}
      />
    );
  }




  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col">
      {/* Top HUD */}
      <div className="px-5 pt-3 flex items-center gap-3 relative z-10">
        <div className="h-11 w-11 rounded-2xl bg-white shadow-soft p-1">
          <img src={mascot} className="w-full h-full object-contain" alt="" />
        </div>
        <div className="flex-1">
          <div className="text-display font-extrabold text-ink">India Journey</div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            {banners[0].done}/{banners[0].total} states · {banners[1].done}/{banners[1].total} UTs
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-soft">
          <span>🪙</span>
          <span className="text-display font-extrabold">{p.xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Clouds */}
      <Cloud className="absolute top-24 left-2 w-24 opacity-90 pointer-events-none" />
      <Cloud className="absolute top-60 right-1 w-20 opacity-85 pointer-events-none" />

      {/* Map */}
      <div className="relative flex-1 mx-3 mt-2 rounded-[28px] overflow-y-auto overflow-x-hidden">
        <div className="relative w-full" style={{ height }}>
          <svg
            className="absolute inset-0 w-full"
            style={{ height }}
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
          >
            {routes.map((route) => {
              const rn = nodes.filter((n) => (route.key === "ut" ? n.isUT : !n.isUT));
              if (rn.length === 0) return null;
              return (
                <path
                  key={route.key}
                  d={rn
                    .map((n, i) =>
                      i === 0
                        ? `M${n.x},${n.y}`
                        : `Q${(rn[i - 1].x + n.x) / 2 + (i % 2 === 0 ? -18 : 18)},${
                            (rn[i - 1].y + n.y) / 2
                          } ${n.x},${n.y}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.4"
                  strokeDasharray={route.key === "ut" ? "3 7" : "6 6"}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Route banners */}
          {banners.map((b) => (
            <div
              key={b.key}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[86%]"
              style={{ top: b.y }}
            >
              <div className="rounded-2xl bg-white/90 backdrop-blur shadow-soft px-4 py-2.5 flex items-center gap-3">
                <span className="text-xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-extrabold text-ink truncate">{b.label}</div>
                  <div className="mt-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className={b.key === "ut" ? "h-full gradient-explorer" : "h-full gradient-gold"}
                      style={{ width: `${(b.done / b.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-muted-foreground whitespace-nowrap">
                  {b.done}/{b.total}
                </span>
              </div>
            </div>
          ))}

          {nodes.map((n, i) => (
            <div
              key={n.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: n.y }}
            >
              <button
                type="button"
                aria-label={`Open ${n.name}`}
                onClick={() => {
                  fxTap();
                  setView({ screen: "intro", name: n.name });
                }}
                className={`flex flex-col items-center active:scale-95 transition-transform ${
                  n.status === "current" ? "animate-bounce" : ""
                }`}
              >
                <div
                  className={`h-16 w-16 rounded-full border-4 flex items-center justify-center text-2xl shadow-lg ${
                    n.status === "done"
                      ? n.isUT
                        ? "gradient-explorer border-white text-white"
                        : "gradient-gold border-white text-white"
                      : n.status === "current"
                      ? "gradient-saffron border-white text-white"
                      : `bg-white/70 border-white text-neutral-400 ${n.isUT ? "border-dashed" : ""}`
                  }`}
                >
                  {n.status === "done" ? "⭐" : n.status === "current" ? "▶" : n.isUT ? "🏝️" : "🔒"}
                </div>
                <div
                  className={`mt-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    n.status === "locked"
                      ? "bg-white/70 text-muted-foreground"
                      : "bg-white text-ink shadow"
                  }`}
                >
                  {n.short}
                </div>
                {n.isUT && (
                  <div className="mt-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-explorer/15 text-explorer">
                    Union Territory
                  </div>
                )}
              </button>
              {i === currentIndex && (
                <img
                  src={airplane}
                  alt=""
                  className="absolute -top-10 -right-8 w-14 h-14 object-contain drop-shadow-lg"
                  style={{ transform: "rotate(20deg)" }}
                />
              )}
            </div>
          ))}

        </div>
      </div>

      <BottomNav active="map" />
      <div className="h-20" />
    </div>
  );
}


const STATE_ART: Record<string, string> = {
  Rajasthan: rajasthan,
  Gujarat: gujarat,
  "Madhya Pradesh": mp,
  Maharashtra: maharashtra,
};

const TONE_GRADIENT: Record<string, string> = {
  orange: "gradient-saffron",
  blue: "gradient-explorer",
  green: "gradient-success",
  gold: "gradient-gold",
};

export function StateIntroScreen({
  stateName,
  onBack,
  onContinue,
}: { stateName?: string; onBack?: () => void; onContinue?: () => void } = {}) {
  const state = getState(stateName);
  const goBack = useGoBack();
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className={`relative h-[46%] ${grad} overflow-hidden`}>
        <Cloud className="absolute top-6 left-2 w-20 opacity-80" />
        <Cloud className="absolute top-14 right-2 w-16 opacity-70" />
        <button
          onClick={() => {
            if (onBack) {
              fxTap();
              onBack();
            } else {
              goBack();
            }
          }}
          className="absolute top-3 left-4 h-10 w-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-white text-xl"
        >
          ‹
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/25 backdrop-blur rounded-full px-3 py-1.5 text-white text-xs font-extrabold">
          State {stateIndex(state.name) + 1} of {TOTAL_STATES}
        </div>
        {art ? (
          <img
            src={art}
            alt=""
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[85%] object-contain drop-shadow-2xl"
          />
        ) : (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-[70%] aspect-square rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-[68px] drop-shadow-2xl">
            {state.emoji}
          </div>
        )}
      </div>

      <div className="-mt-8 rounded-t-[36px] bg-white flex-1 px-5 pt-6 pb-5 relative z-10">
        <div className="text-xs font-black uppercase tracking-widest text-saffron">
          Welcome to
        </div>
        <h1 className="text-display text-4xl font-extrabold leading-none mt-1">
          {state.name}
        </h1>
        <div className="text-sm font-bold text-muted-foreground mt-1">
          {state.emoji} {state.nickname}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <IntroFact label="Capital" value={state.capital} icon="🏛️" />
          <IntroFact label="Language" value={state.language} icon="🗣️" />
          <IntroFact label="Population" value={state.population} icon="👥" />
          <IntroFact label="Animal" value={state.animalName} icon={state.animal} />
        </div>

        <button
          onClick={() => {
            fxTap();
            onContinue?.();
          }}
          className={`mt-6 w-full h-14 rounded-2xl ${grad} text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]`}
        >
          Start Exploring! ✈️
        </button>
      </div>
    </div>
  );
}


function IntroFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-saffron-soft/60 p-3 border border-saffron/15">
      <div className="text-lg">{icon}</div>
      <div className="text-[10px] font-black uppercase tracking-wider text-saffron mt-1">
        {label}
      </div>
      <div className="text-display font-extrabold text-lg leading-tight">
        {value}
      </div>
    </div>
  );
}

export function LearningHubScreen({
  stateName,
  onBack,
  onQuiz,
  onCard,
}: {
  stateName?: string;
  onBack?: () => void;
  onQuiz?: () => void;
  onCard?: (index: number) => void;
} = {}) {
  const progress = useProgress();
  const goBack = useGoBack();
  const state = getState(stateName);
  const live = statesWithProgress(progress).find((s) => s.name === state.name);
  const status = live?.status ?? state.status;
  const read = cardsRead(progress, state.name);
  const completedCards = cardsDone(progress, state.name);
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";

  const cards = [
    { icon: "🏛️", title: "Capital", sub: state.capital, tone: "orange" as const },
    { icon: "🗣️", title: "Language", sub: state.language, tone: "blue" as const },
    { icon: "🍛", title: "Famous Food", sub: state.food, tone: "gold" as const },
    { icon: state.monument, title: "Places", sub: state.monumentName, tone: "green" as const },
    { icon: state.animal, title: "State Animal", sub: state.animalName, tone: "orange" as const },
    { icon: "💡", title: "Fun Fact", sub: state.funFact, tone: "blue" as const },
  ].map((c, i) => ({
    ...c,
    index: i,
    done: read.includes(i) || completedCards >= CARDS_PER_STATE,
    active: i === completedCards && status !== "locked",
    locked: status === "locked",
    onOpen: () => onCard?.(i),
  }));

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) {
                fxTap();
                onBack();
              } else {
                goBack();
              }
            }}
            className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
          >
            ‹
          </button>
          <div className="flex-1 text-white">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-90">
              Learning Hub
            </div>
            <div className="text-display text-xl font-extrabold">{state.name}</div>
          </div>
          <div className="flex items-center gap-1 text-white text-display font-extrabold">
            <span>⭐</span> {completedCards * XP_PER_CARD}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-white">
          <div className="flex-1 h-2.5 rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${(completedCards / 6) * 100}%` }}
            />
          </div>
          <span className="text-xs font-extrabold">{completedCards} / 6</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 flex-1 overflow-auto">
        {cards.map((c) => (
          <HubCard key={c.title} {...c} />
        ))}
      </div>
      <div className="p-4">
        <button
          onClick={() => {
            fxTap();
            onQuiz?.();
          }}
          className="w-full h-14 rounded-2xl gradient-success text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-green)]"
        >
          Take the Quiz! 🎯
        </button>
      </div>
    </div>
  );
}


function HubCard({
  icon,
  title,
  sub,
  tone,
  done,
  active,
  locked,
  onOpen,
}: {
  icon: string;
  title: string;
  sub: string;
  tone: "orange" | "blue" | "green" | "gold";
  done?: boolean;
  active?: boolean;
  locked?: boolean;
  index?: number;
  onOpen?: () => void;
}) {
  const bg = {
    orange: "bg-saffron-soft",
    blue: "bg-explorer-soft",
    green: "bg-success-soft",
    gold: "bg-gold-soft",
  }[tone];
  const ring = {
    orange: "border-saffron",
    blue: "border-explorer",
    green: "border-success",
    gold: "border-[color:var(--gold)]",
  }[tone];
  return (
    <button
      type="button"
      onClick={() => {
        if (locked) return;
        fxTap();
        onOpen?.();
      }}
      className={`relative text-left rounded-3xl p-4 shadow-soft border-2 transition active:scale-[0.98] ${
        active ? ring : "border-transparent"
      } ${locked ? "bg-muted opacity-70" : `${bg}`}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="text-display text-base font-extrabold mt-1 leading-tight">
        {title}
      </div>
      <div className="text-xs font-bold text-muted-foreground">{sub}</div>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              done ? "bg-success" : active && i === 1 ? "bg-saffron" : "bg-black/10"
            }`}
          />
        ))}
      </div>
      {done && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-success text-white flex items-center justify-center text-xs font-black">
          ✓
        </div>
      )}
      {locked && (
        <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs">
          🔒
        </div>
      )}
    </button>
  );
}

export function learningCardsFor(stateName?: string) {
  const state = getState(stateName);
  return [
    {
      kicker: "Capital",
      title: state.capital,
      icon: "🏛️",
      chip: "Capital City",
      body: `${state.capital} is the capital city of ${state.name}. It is where the state's government works from.`,
    },
    {
      kicker: "Language",
      title: state.language,
      icon: "🗣️",
      chip: "Language",
      body: `People in ${state.name} mostly speak ${state.language}. Try saying hello in it!`,
    },
    {
      kicker: "Famous Food",
      title: state.food,
      icon: "🍛",
      chip: "Food",
      body: `${state.food} is a favourite dish of ${state.name}. Yum!`,
    },
    {
      kicker: "Places",
      title: state.monumentName,
      icon: state.monument,
      chip: "Monument",
      body: `${state.monumentName} is a treasure of ${state.name}, ${state.nickname.toLowerCase()}.`,
    },
    {
      kicker: "State Animal",
      title: state.animalName,
      icon: state.animal,
      chip: "Animal",
      body: `The ${state.animalName} is a special animal you can find in ${state.name}.`,
    },
    {
      kicker: "Fun Fact",
      title: "Did you know?",
      icon: "💡",
      chip: "Fun Fact",
      body: state.funFact,
    },
  ];
}

export function LearningCardScreen({
  stateName,
  cardIndex = 0,
  onNext,
  onClose,
}: {
  stateName?: string;
  cardIndex?: number;
  onNext?: (nextIndex: number | null) => void;
  onClose?: () => void;
} = {}) {
  const state = getState(stateName);
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  const cards = learningCardsFor(state.name);
  const i = Math.min(Math.max(cardIndex, 0), cards.length - 1);
  const card = cards[i];
  const isLast = i === cards.length - 1;

  return (
    <div className="h-full w-full bg-[#FDF7EF] flex flex-col">
      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <button
          onClick={() => {
            fxTap();
            onClose?.();
          }}
          aria-label="Close"
          className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ✕
        </button>
        <div className="flex-1 h-3 rounded-full bg-white overflow-hidden shadow-inner">
          <div
            className={`h-full ${grad} transition-all`}
            style={{ width: `${((i + 1) / cards.length) * 100}%` }}
          />
        </div>
        <div className="text-display font-extrabold text-saffron">
          {i + 1}/{cards.length}
        </div>
      </div>

      <div className="px-5 mt-2">
        <div className="text-xs font-black uppercase tracking-wider text-saffron">
          {state.name} · {card.kicker}
        </div>
        <h2 className="text-display text-2xl font-extrabold leading-tight mt-1">
          {card.title}
        </h2>
      </div>

      <div className="mx-5 mt-4 rounded-3xl bg-white shadow-soft border border-black/5 p-4 flex-1 flex flex-col">
        <div className="flex-1 gradient-sky rounded-2xl flex items-center justify-center overflow-hidden">
          {art && card.kicker === "Places" ? (
            <img src={art} alt="" className="h-full object-contain drop-shadow-xl" />
          ) : (
            <div className="text-[92px] drop-shadow-xl">{card.icon}</div>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Chip icon={card.icon} tone="orange">
              {card.chip}
            </Chip>
            <Chip icon="📍" tone="blue">
              {state.name}
            </Chip>
          </div>
          <p className="mt-2 font-semibold text-ink/85 text-[15px] leading-snug">
            {card.body}
          </p>
        </div>
      </div>

      <div className="p-5 flex items-center gap-3">
        <button className="h-14 w-14 rounded-2xl bg-white shadow-soft flex items-center justify-center text-xl">
          🔊
        </button>
        <button
          onClick={() => {
            fxTap();
            markCard(state.name, i);
            onNext?.(isLast ? null : i + 1);
          }}
          className={`flex-1 h-14 rounded-2xl ${grad} text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]`}
        >
          {isLast ? "Take the Quiz! 🎯" : "Got it! Next →"}
        </button>
      </div>
    </div>
  );
}


export function QuizScreen({
  stateName,
  onDone,
  onClose,
}: { stateName?: string; onDone?: () => void; onClose?: () => void } = {}) {
  const progress = useProgress();
  const states = statesWithProgress(progress);
  const activeName =
    stateName ??
    states.find((s) => s.status === "current")?.name ??
    states.find((s) => s.status !== "done")?.name ??
    states[0].name;

  const questions = useMemo(() => randomQuestionsForState(activeName, 3), [activeName]);
  const [index, setIndex] = useState(0);
  const question = questions[Math.min(index, questions.length - 1)];

  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const answers = question.options;
  const correct = question.correct;

  const onSelect = (label: string) => {
    if (result) return;
    fxTap();
    setSelected(label);
  };
  const onCheck = () => {
    if (!selected || result) return;
    if (selected === correct) {
      fxCorrect();
      addXP(question.xp, question.id);
      setResult("correct");
    } else {
      fxWrong();
      setResult("wrong");
    }
  };
  const isLastQuestion = index === questions.length - 1;
  const onReset = () => {
    fxTap();
    if (result === "correct") {
      if (isLastQuestion) {
        onDone?.();
        return;
      }
      setIndex((i) => i + 1);
    }
    setResult(null);
    setSelected(null);
  };

  return (
    <div className="h-full w-full bg-explorer-soft flex flex-col">
      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <button
          onClick={() => {
            fxTap();
            onClose?.();
          }}
          aria-label="Close"
          className="h-10 w-10 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
        >
          ✕
        </button>
        <div className="flex-1 flex items-center gap-1">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-2.5 flex-1 rounded-full ${
                i < index ? "bg-success" : i === index ? "gradient-explorer" : "bg-white"
              }`}
            />
          ))}
        </div>
        <div className="text-display font-extrabold text-explorer">
          Q{index + 1}/{questions.length}
        </div>
      </div>

      <div className="px-5 mt-3 flex items-center gap-3">
        <img src={mascot} alt="" className="w-16 h-16 object-contain" />
        <div className="relative bg-white rounded-2xl shadow-soft px-3 py-2 text-sm font-extrabold">
          {result === "correct"
            ? "Nailed it! 🎉"
            : result === "wrong"
            ? "So close — try again!"
            : "You've got this! 💪"}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-3 h-3 rotate-45 bg-white" />
        </div>
        <div className="ml-auto flex items-center gap-1 bg-white rounded-full px-2.5 py-1 shadow-soft">
          <span>⭐</span>
          <span className="text-display font-extrabold text-sm">+{question.xp}</span>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="text-[11px] font-black uppercase tracking-widest text-explorer">
          {question.kicker}
        </div>
        <h2 className="text-display text-2xl font-extrabold leading-tight mt-1">
          {question.prompt}
        </h2>
      </div>


      <div className="p-5 mt-2 flex-1 flex flex-col gap-3">
        {answers.map((label) => {
          const isSelected = selected === label;
          const isCorrectPick = result && label === correct;
          const isWrongPick = result === "wrong" && isSelected;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`h-16 rounded-2xl px-5 flex items-center justify-between text-display text-lg font-extrabold shadow-soft border-2 transition-colors active:scale-[0.99] ${
                isCorrectPick
                  ? "bg-success/10 border-success text-success"
                  : isWrongPick
                  ? "bg-rose-50 border-rose-500 text-rose-600"
                  : isSelected
                  ? "bg-white border-explorer text-explorer shadow-[var(--shadow-glow-blue)]"
                  : "bg-white border-transparent text-ink"
              }`}
            >
              {label}
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                  isCorrectPick
                    ? "bg-success text-white"
                    : isWrongPick
                    ? "bg-rose-500 text-white"
                    : isSelected
                    ? "gradient-explorer text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCorrectPick ? "✓" : isWrongPick ? "✕" : isSelected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <button
          onClick={result ? onReset : onCheck}
          disabled={!selected}
          className={`w-full h-14 rounded-2xl text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-blue)] disabled:opacity-50 ${
            result === "correct"
              ? "bg-success"
              : result === "wrong"
              ? "bg-rose-500"
              : "gradient-explorer"
          }`}
        >
          {result === "correct"
            ? isLastQuestion
              ? "Finish Quiz 🎉"
              : "Next Question →"
            : result === "wrong"
            ? "Try Again"
            : "Check Answer"}
        </button>
      </div>
    </div>
  );
}

export function CorrectAnswerScreen({ stateName }: { stateName?: string } = {}) {
  const state = getState(stateName);
  useEffect(() => { fxCorrect(); }, []);
  return (
    <div className="h-full w-full gradient-success relative overflow-hidden flex flex-col">
      {/* confetti dots */}
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 80}%`,
            background: ["#FFD84D", "#FF7A1A", "#fff", "#2E7DFF"][i % 4],
            transform: `rotate(${i * 20}deg)`,
            opacity: 0.9,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-white/40 rounded-full" />
          <div className="relative h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <div className="text-6xl">✅</div>
          </div>
        </div>
        <h1 className="mt-6 text-display text-4xl font-extrabold text-white text-center leading-none">
          Awesome!
        </h1>
        <p className="mt-2 text-white/95 font-bold text-center">
          You got it right — {state.capital} is the capital of {state.name}!
        </p>

        <div className="mt-6 rounded-2xl bg-white/20 backdrop-blur px-5 py-3 flex items-center gap-3 text-white">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="text-xs font-bold opacity-90">You earned</div>
            <div className="text-display text-2xl font-extrabold leading-none">
              +20 XP
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 relative">
        <button className="w-full h-14 rounded-2xl bg-white text-success text-display text-lg font-extrabold shadow-lg">
          Next Question →
        </button>
      </div>
    </div>
  );
}

export function StateCompletedScreen({
  stateName,
  persist = true,
  onContinue,
}: { stateName?: string; persist?: boolean; onContinue?: () => void } = {}) {
  const state = getState(stateName);
  const art = STATE_ART[state.name];
  const grad = TONE_GRADIENT[state.tone] ?? "gradient-saffron";
  useEffect(() => {
    fxConfetti();
    if (persist) completeState(state.name);
  }, [state.name, persist]);
  return (
    <div className="h-full w-full gradient-gold relative overflow-hidden flex flex-col items-center">
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${(i * 29) % 100}%`,
            top: `${(i * 47) % 70}%`,
            width: 6 + (i % 4) * 2,
            height: 12 + (i % 3) * 3,
            background: ["#FF7A1A", "#2E7DFF", "#fff", "#22C55E", "#F5B301"][i % 5],
            transform: `rotate(${i * 15}deg)`,
          }}
        />
      ))}

      <div className="mt-10 text-center relative px-6">
        <div className="text-white/90 text-xs font-black uppercase tracking-[0.3em]">
          State Complete
        </div>
        <h1 className="text-display text-4xl font-extrabold text-white mt-1 drop-shadow leading-none">
          {state.name} Cleared!
        </h1>
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 blur-3xl bg-white/40 rounded-full" />
        <div className="relative h-48 w-48 rounded-full bg-white flex items-center justify-center shadow-2xl border-8 border-white">
          <div className={`h-full w-full rounded-full ${grad} flex flex-col items-center justify-center text-white px-2`}>
            {art ? (
              <img src={art} alt="" className="h-20 object-contain drop-shadow" />
            ) : (
              <div className="text-[54px] leading-none drop-shadow">{state.emoji}</div>
            )}
            <div className="text-display font-extrabold text-sm mt-1 text-center leading-tight uppercase">
              {state.name}
            </div>
            <div className="text-[9px] font-bold opacity-90">EXPLORER · LVL 1</div>
          </div>
        </div>
      </div>


      <div className="mt-5 w-full px-6">
        <div className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] text-center">
          Badges Earned
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { icon: state.monument, name: "Monument" },
            { icon: state.animal, name: "Animal" },
            { icon: "🎖️", name: "Explorer" },
          ].map((b) => (
            <div
              key={b.name}
              className="rounded-2xl bg-white/25 backdrop-blur p-2 text-white flex flex-col items-center animate-fade-in"
            >
              <div className="h-11 w-11 rounded-full bg-white/35 flex items-center justify-center text-xl">
                {b.icon}
              </div>
              <div className="mt-1 text-[10px] font-extrabold">{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 w-full px-6">
        <div className="rounded-2xl bg-white/25 backdrop-blur p-3 text-white text-center">
          <div className="text-2xl">⭐</div>
          <div className="text-display text-xl font-extrabold leading-none">
            +250 XP
          </div>
          <div className="text-[10px] font-bold opacity-90">Earned</div>
        </div>
        <div className="rounded-2xl bg-white/25 backdrop-blur p-3 text-white text-center">
          <div className="text-2xl">📜</div>
          <div className="text-display text-xl font-extrabold leading-none">
            Stamp
          </div>
          <div className="text-[10px] font-bold opacity-90">Unlocked</div>
        </div>
      </div>

      <div className="mt-auto p-6 w-full">
        <button
          onClick={() => {
            fxTap();
            onContinue?.();
          }}
          className="w-full h-14 rounded-2xl bg-white text-[color:var(--gold)] text-display text-lg font-extrabold shadow-xl"
        >
          Continue Adventure →
        </button>
      </div>
    </div>
  );
}

export function StateUnlockScreen({
  stateName,
  onContinue,
}: { stateName?: string; onContinue?: () => void } = {}) {
  const state = stateName ? getState(stateName) : INDIA_STATES[1];
  const art = STATE_ART[state.name];
  return (
    <div className="h-full w-full gradient-explorer relative overflow-hidden flex flex-col">
      <Cloud className="absolute top-10 left-2 w-28 opacity-90" />
      <Cloud className="absolute top-20 right-0 w-24 opacity-85" />
      <Cloud className="absolute bottom-56 left-0 w-32 opacity-80" />

      <div className="text-center pt-8 relative z-10 px-6">
        <div className="text-white/90 text-xs font-black uppercase tracking-[0.3em]">
          New State Unlocked
        </div>
        <h1 className="text-display text-4xl font-extrabold text-white mt-1 drop-shadow leading-none">
          {state.name}!
        </h1>
        <p className="text-white/90 font-bold mt-1">{state.nickname}</p>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-72 rounded-[40px] bg-white/10 backdrop-blur border border-white/20" />
        <div className="absolute inset-x-16 bottom-24 h-8 rounded-full bg-black/20 blur-xl" />
        {art ? (
          <img
            src={art}
            alt=""
            className="relative h-72 object-contain drop-shadow-2xl animate-fade-in"
          />
        ) : (
          <div className="relative text-[130px] drop-shadow-2xl animate-fade-in">
            {state.emoji}
          </div>
        )}
        <img
          src={airplane}
          alt=""
          className="absolute top-16 right-6 w-16 object-contain drop-shadow-xl"
          style={{ transform: "rotate(15deg)" }}
        />
      </div>

      <div className="p-6 relative z-10">
        <button
          onClick={() => {
            fxTap();
            onContinue?.();
          }}
          className="w-full h-14 rounded-2xl bg-white text-explorer text-display text-lg font-extrabold shadow-xl"
        >
          Continue Adventure ✈️
        </button>
      </div>

    </div>
  );
}

export function PassportScreen() {
  const p = useProgress();
  const stamps = statesWithProgress(p).map((s) => ({
    name: s.short,
    date: s.date ?? "—",
    tone: s.tone,
    filled: s.status === "done",
  }));
  const pct = Math.round((p.completed.length / TOTAL_STATES) * 100);

  return (
    <div className="h-full w-full bg-[#F5EFE4] flex flex-col">
      <HeaderBar title="My Passport" />
      <div className="px-5">
        <div className="rounded-3xl gradient-passport text-[#f5e6c8] p-5 shadow-soft relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-4 border-[#c9a34a]/30" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            Republic of Adventure
          </div>
          <div className="text-display text-2xl font-extrabold mt-1">
            EXPLORER PASSPORT
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-[#f5e6c8]/20 p-1">
              <img src={mascot} className="w-full h-full object-contain" alt="" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase opacity-70">
                Name
              </div>
              <div className="text-display font-extrabold text-lg leading-none">
                {p.name}
              </div>
              <div className="text-[10px] font-bold opacity-80 mt-0.5">
                Passport No. IN-2026-0042
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-bold opacity-90">
              <span>India Progress</span>
              <span className="text-[#f5b301]">{pct}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full bg-[#F5B301]" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[10px] font-bold opacity-70 mt-1">
              {p.completed.length} of {TOTAL_STATES} states stamped
            </div>

          </div>
        </div>
      </div>

      <div className="px-5 mt-4 flex-1 overflow-auto pb-24">
        <div className="text-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground">
          Collected Stamps
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {stamps.map((s) => (
            <Stamp key={s.name} {...s} />
          ))}
        </div>
      </div>
      <BottomNav active="passport" />
      <div className="h-20" />
    </div>
  );
}

function Stamp({
  name,
  date,
  tone,
  filled,
}: {
  name: string;
  date: string;
  tone: "orange" | "blue" | "green" | "gold";
  filled?: boolean;
}) {
  const color = {
    orange: "#FF7A1A",
    blue: "#2E7DFF",
    green: "#22C55E",
    gold: "#F5B301",
  }[tone];
  if (!filled) {
    return (
      <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground">
        <div className="text-3xl opacity-40">🔒</div>
        <div className="text-[11px] font-extrabold mt-1">{name}</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={fxStamp}
      className="relative aspect-square rounded-2xl bg-[#f5e6c8] flex flex-col items-center justify-center active:scale-95 transition-transform"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
    >
      <div
        className="h-20 w-20 rounded-full border-[3px] flex flex-col items-center justify-center"
        style={{ borderColor: color, color }}
      >
        <div className="text-[9px] font-black tracking-widest opacity-80">
          VISITED
        </div>
        <div className="text-display font-extrabold text-[11px] leading-tight text-center px-1">
          {name}
        </div>
        <div className="text-[8px] font-bold opacity-80">{date}</div>
      </div>
      <div
        className="absolute -top-1 -right-1 text-[10px] font-black rotate-12 px-1.5 py-0.5 rounded"
        style={{ background: color, color: "white" }}
      >
        ✓
      </div>
    </button>
  );
}

export function BadgesScreen() {
  const p = useProgress();
  const rows = statesWithProgress(p).map((s) => {
    const earned = badgesFor(p, s.name);
    const icons: Record<string, string> = {
      monument: s.monument,
      animal: s.animal,
      explorer: "🎖️",
    };
    return {
      state: s.name,
      tone: s.tone,
      badges: STATE_BADGES.map((b) => ({
        icon: icons[b.id],
        name: b.name,
        done: earned.includes(b.id),
      })),
    };
  });
  const earnedCount = rows.reduce(
    (acc, r) => acc + r.badges.filter((b) => b.done).length,
    0
  );
  const totalCount = rows.length * 3;

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <HeaderBar
        title="Badges"
        right={
          <span className="text-display font-extrabold text-saffron">
            {earnedCount}/{totalCount}
          </span>
        }
      />

      <div className="px-5">
        <div className="rounded-3xl gradient-gold p-4 text-white shadow-soft flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white/25 flex items-center justify-center text-3xl">
            🏅
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-90">
              Collection
            </div>
            <div className="text-display text-xl font-extrabold leading-none">
              {earnedCount} badges earned
            </div>

            <div className="text-[11px] font-bold opacity-90 mt-0.5">
              You're in the top 10% of explorers!
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-auto space-y-4 pb-24">
        {rows.map((r) => (
          <div key={r.state}>
            <div className="text-display font-extrabold text-sm">{r.state}</div>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {r.badges.map((b) => (
                <div
                  key={b.name}
                  className={`rounded-2xl p-3 flex flex-col items-center bg-white shadow-soft border ${
                    b.done ? "border-black/5" : "border-dashed border-muted-foreground/30 opacity-60"
                  }`}
                >
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl ${
                      b.done
                        ? r.tone === "orange"
                          ? "gradient-saffron"
                          : r.tone === "gold"
                          ? "gradient-gold"
                          : r.tone === "blue"
                          ? "gradient-explorer"
                          : "gradient-success"

                        : "bg-muted"
                    }`}
                  >
                    {b.done ? b.icon : "🔒"}
                  </div>
                  <div className="mt-1 text-[11px] font-extrabold">{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="badges" />
      <div className="h-20" />
    </div>
  );
}

export function ProfileScreen() {
  const p = useProgress();
  const { level } = levelInfo(p.xp);
  const goBack = useGoBack();
  const stampsCollected = Object.keys(p.stamps ?? {}).length;
  const achievements = achievementsFor(p);
  const unlockedAchievements = achievements.filter((a) => a.done).length;
  const inProgressAchievements = achievements.filter((a) => !a.done && a.prog > 0).length;
  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <div className="relative gradient-explorer px-5 pt-4 pb-14 rounded-b-[36px]">
        <Cloud className="absolute top-2 right-2 w-16 opacity-40" />
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-display font-extrabold text-white">Profile</div>
          <button
            onClick={() => {
              fxTap();
              resetProgress();
            }}
            title="Reset progress"
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            ⟲
          </button>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-white p-2 shadow-xl flex items-center justify-center text-5xl">
              <span>{p.avatar}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full gradient-gold text-white flex items-center justify-center text-display text-sm font-extrabold border-4 border-white">
              {level}
            </div>
          </div>
          <div className="mt-3 text-display text-2xl font-extrabold text-white">
            {p.name}
          </div>
          <div className="text-white/90 text-xs font-extrabold uppercase tracking-widest">
            Junior Explorer · Age {p.ageBand}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-10">
        <div className="rounded-3xl bg-white shadow-soft border border-black/5 p-4 grid grid-cols-3 divide-x divide-black/5">
          <ProfileStat value={p.xp.toLocaleString()} label="XP" />
          <ProfileStat value={String(p.completed.length)} label="States" />
          <ProfileStat value={String(badgeCount(p))} label="Badges" />
        </div>
      </div>


      <div className="px-5 mt-5 space-y-3 flex-1 overflow-auto pb-24">
        <SoundToggleRow />
        <RowLink
          icon="📓"
          tone="orange"
          title="My Passport"
          sub={`${stampsCollected} ${stampsCollected === 1 ? "stamp" : "stamps"} collected`}
          to="/passport"
        />
        <RowLink
          icon="🏅"
          tone="gold"
          title="Achievements"
          sub={`${unlockedAchievements} unlocked · ${inProgressAchievements} in progress`}
          to="/achievements"
        />
        <RowLink
          icon="🎯"
          tone="green"
          title="Daily Goals"
          sub={`🔥 ${p.streak} day streak`}
          to="/achievements"
        />
        <RowLink
          icon="👨‍👩‍👧"
          tone="blue"
          title="Parent Zone"
          sub="Progress reports & controls"
          to="/parent"
        />
      </div>
      <BottomNav active="profile" />
      <div className="h-20" />
    </div>
  );
}

function SoundToggleRow() {
  const on = useSoundOn();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Sound and vibration"
      onClick={() => {
        setSoundOn(!on);
        if (!on) fxTap();
      }}
      className="w-full rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className="h-12 w-12 rounded-2xl gradient-explorer flex items-center justify-center text-2xl">
        {on ? "🔊" : "🔇"}
      </div>
      <div className="flex-1 text-left">
        <div className="text-display font-extrabold text-[15px] leading-tight">Sound & Vibration</div>
        <div className="text-[11px] font-bold text-muted-foreground">
          {on ? "Sounds are on" : "Sounds are off"}
        </div>
      </div>
      <span
        className={`h-7 w-12 rounded-full flex items-center px-1 transition ${on ? "gradient-success" : "bg-muted"}`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="text-display text-xl font-extrabold">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function RowLink({
  icon,
  tone,
  title,
  sub,
  to,
}: {
  icon: string;
  tone: "orange" | "blue" | "green" | "gold";
  title: string;
  sub: string;
  to: "/passport" | "/achievements" | "/parent" | "/badges" | "/journey";
}) {
  const bg = {
    orange: "gradient-saffron",
    blue: "gradient-explorer",
    green: "gradient-success",
    gold: "gradient-gold",
  }[tone];
  return (
    <Link
      to={to}
      onClick={() => fxTap()}
      className="rounded-2xl bg-white shadow-soft border border-black/5 p-3 flex items-center gap-3 transition active:scale-[0.99]"
    >
      <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-display font-extrabold text-[15px] leading-tight">
          {title}
        </div>
        <div className="text-[11px] font-bold text-muted-foreground">{sub}</div>
      </div>
      <div className="text-muted-foreground text-xl">›</div>
    </Link>
  );
}

export function AchievementsScreen() {
  const progress = useProgress();
  const items = achievementsFor(progress);
  const unlocked = items.filter((a) => a.done).length;

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col">
      <HeaderBar title="Achievements" />
      <div className="px-5 pb-3">
        <div className="rounded-2xl bg-white shadow-soft border border-black/5 px-4 py-3 flex items-center justify-between">
          <div className="text-[12px] font-extrabold text-muted-foreground uppercase tracking-wider">
            Unlocked
          </div>
          <div className="text-display font-extrabold text-[16px]">
            {unlocked}/{items.length}
          </div>
        </div>
      </div>
      <div className="px-5 flex-1 overflow-auto pb-6 space-y-3">
        {items.map((a) => (

          <div
            key={a.title}
            className={`rounded-3xl bg-white shadow-soft border p-4 flex items-center gap-3 ${
              a.done ? "border-[color:var(--gold)]/40" : "border-black/5"
            }`}
          >
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${
                a.done
                  ? "gradient-gold"
                  : a.tone === "orange"
                  ? "bg-saffron-soft"
                  : a.tone === "blue"
                  ? "bg-explorer-soft"
                  : a.tone === "green"
                  ? "bg-success-soft"
                  : "bg-gold-soft"
              }`}
            >
              {a.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-display font-extrabold text-[16px]">
                  {a.title}
                </div>
                {a.done && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gold-soft text-[color:var(--gold)] px-1.5 py-0.5 rounded-full">
                    Unlocked
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold text-muted-foreground">
                {a.sub}
              </div>
              {!a.done && "prog" in a && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${
                        a.tone === "orange"
                          ? "gradient-saffron"
                          : a.tone === "blue"
                          ? "gradient-explorer"
                          : a.tone === "green"
                          ? "gradient-success"
                          : "gradient-gold"
                      }`}
                      style={{ width: `${(a.prog / a.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-extrabold text-muted-foreground">
                    {a.prog}/{a.max}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="h-full w-full gradient-sky relative overflow-hidden flex flex-col items-center justify-center">
      <Cloud className="absolute top-14 left-2 w-24 opacity-90 animate-pulse" />
      <Cloud className="absolute top-32 right-4 w-20 opacity-80" />
      <Cloud className="absolute bottom-40 left-6 w-28 opacity-85 animate-pulse" />
      <Cloud className="absolute bottom-56 right-2 w-16 opacity-70" />

      <div className="relative">
        <div className="absolute -inset-6 rounded-full border-2 border-dashed border-explorer/30 animate-spin" />
        <img
          src={airplane}
          alt=""
          className="relative w-40 h-40 object-contain drop-shadow-2xl"
          style={{ transform: "rotate(-10deg)" }}
        />
      </div>
      <div className="mt-8 text-center">
        <div className="text-display text-2xl font-extrabold">Flying to Gujarat…</div>
        <div className="text-sm font-bold text-muted-foreground mt-1">
          Packing camel snacks 🐪
        </div>
      </div>
      <div className="mt-6 w-56 h-2 rounded-full bg-white/70 overflow-hidden">
        <div className="h-full w-2/3 gradient-explorer animate-pulse" />
      </div>
    </div>
  );
}

export function EmptyStateScreen() {
  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Friends" />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-saffron/25 rounded-full" />
          <img src={mascot} alt="" className="relative w-52 h-52 object-contain" />
        </div>
        <h2 className="text-display text-2xl font-extrabold mt-4">
          No explorer friends yet!
        </h2>
        <p className="mt-2 text-sm font-bold text-muted-foreground max-w-[260px]">
          Invite a friend to join your adventure and travel across India
          together.
        </p>
        <button className="mt-6 h-14 px-6 rounded-2xl gradient-saffron text-white text-display text-lg font-extrabold shadow-[var(--shadow-glow-orange)]">
          Invite a Friend ✨
        </button>
        <button className="mt-2 h-12 px-6 rounded-2xl bg-muted text-ink text-display font-extrabold">
          Maybe later
        </button>
      </div>
    </div>
  );
}
