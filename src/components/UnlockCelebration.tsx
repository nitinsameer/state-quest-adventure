import { useEffect, useRef, useState } from "react";
import { useCelebration } from "@/hooks/useCelebration";
import { useProgress, achievementsFor, STATE_BADGES, type BadgeId } from "@/lib/progress";
import { fxConfetti } from "@/lib/fx";
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const BADGE_ICON: Record<BadgeId, string> = {
  monument: EMOJI.achievement.monument,
  animal: EMOJI.achievement.animal,
  explorer: EMOJI.achievement.explorer,
};

function badgeKeys(badges: Record<string, BadgeId[]> | undefined) {
  const keys: string[] = [];
  for (const [state, list] of Object.entries(badges ?? {})) {
    for (const id of list) keys.push(`${state}:${id}`);
  }
  return keys;
}

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
};

const CELEBRATED_KEY = STORAGE_KEYS.celebratedUnlocks;

function loadCelebrated(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CELEBRATED_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(
      Array.isArray(list) ? list.filter((v): v is string => typeof v === "string") : [],
    );
  } catch {
    return new Set();
  }
}

function saveCelebrated(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage unavailable — celebrations simply replay next load */
  }
}

const COLORS = [
  "var(--accent-1)", // Saffron
  "var(--accent-2)", // Explorer blue
  "var(--accent-3)", // Success green
  "var(--accent-4)", // Gold
  "var(--background)", // White
];

function makePieces(seed: number): Piece[] {
  return Array.from({ length: 60 }).map((_, i) => ({
    id: seed * 1000 + i,
    left: (i * 37 + seed * 13) % 100,
    delay: ((i * 17) % 10) / 10,
    duration: 1.8 + ((i * 7) % 12) / 10,
    color: COLORS[(i + seed) % COLORS.length],
    size: 6 + (i % 4) * 3,
    rotate: (i * 31) % 360,
  }));
}

/**
 * Global watcher: fires a celebratory popup + confetti burst whenever a new
 * achievement or state badge is unlocked.
 */
export function UnlockCelebration() {
  const progress = useProgress();
  const celebration = useCelebration();
  const [pieces, setPieces] = useState<Piece[] | null>(null);
  const burstRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAchievements = useRef<Set<string> | null>(null);
  const prevBadges = useRef<Set<string> | null>(null);
  /** every key ever celebrated — persisted so reloads never replay a burst */
  const celebrated = useRef<Set<string>>(new Set());
  const hydrated = useRef(false);
  if (typeof window !== "undefined" && !hydrated.current) {
    hydrated.current = true;
    celebrated.current = loadCelebrated();
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    // GATE: Only show achievement popups AFTER user completes onboarding
    // During onboarding, suppress celebrations to avoid UI noise
    if (!progress.onboarded) {
      console.log("[UnlockCelebration] Onboarding in progress - suppressing popups");
      return;
    }

    // GATE: Suppress all achievement popups on first login (fresh user)
    // First login is when user just finished onboarding (onboarded=true, xp=0 or minimal)
    // This avoids annoying users with "Fired Up" streak badge on day 1
    const isFirstLogin = progress.xp === 0;
    if (isFirstLogin) {
      console.log("[UnlockCelebration] First login after onboarding - suppressing all popups");

      // Still record baseline so we don't celebrate these on future logins
      const achievements = achievementsFor(progress).filter((a) => a.done);
      const achievementIds = new Set(achievements.map((a) => a.id));
      const badges = new Set(badgeKeys(progress.badges));

      prevAchievements.current = achievementIds;
      prevBadges.current = badges;
      for (const id of achievementIds) celebrated.current.add(`a:${id}`);
      for (const k of badges) celebrated.current.add(`b:${k}`);
      saveCelebrated(celebrated.current);
      return;
    }

    const achievements = achievementsFor(progress).filter((a) => a.done);
    const achievementIds = new Set(achievements.map((a) => a.id));
    const badges = new Set(badgeKeys(progress.badges));

    console.log("[UnlockCelebration] Checking for new unlocks:", {
      onboarded: progress.onboarded,
      xp: progress.xp,
      celebratedCount: celebrated.current.size,
      achievementCount: achievementIds.size,
      badgeCount: badges.size,
      prevAchievementsNull: !prevAchievements.current,
      prevBadgesNull: !prevBadges.current,
      isFirstRun: !prevAchievements.current || !prevBadges.current,
    });

    // First run after hydration: record the baseline, celebrate nothing.
    if (!prevAchievements.current || !prevBadges.current) {
      console.log("[UnlockCelebration] First run - setting baseline, NOT celebrating");
      prevAchievements.current = achievementIds;
      prevBadges.current = badges;
      for (const id of achievementIds) celebrated.current.add(`a:${id}`);
      for (const k of badges) celebrated.current.add(`b:${k}`);
      saveCelebrated(celebrated.current);
      return;
    }

    const newAchievements = achievements.filter(
      (a) => !prevAchievements.current!.has(a.id) && !celebrated.current.has(`a:${a.id}`),
    );
    const newBadges = [...badges].filter(
      (k) => !prevBadges.current!.has(k) && !celebrated.current.has(`b:${k}`),
    );

    console.log("[UnlockCelebration] New unlocks found:", {
      newAchievements: newAchievements.map((a) => a.id),
      newBadges,
    });

    prevAchievements.current = achievementIds;
    prevBadges.current = badges;

    if (newAchievements.length === 0 && newBadges.length === 0) return;

    for (const a of newAchievements) celebrated.current.add(`a:${a.id}`);
    for (const k of newBadges) celebrated.current.add(`b:${k}`);
    saveCelebrated(celebrated.current);

    // Build celebration subtitle with all unlocked items
    const lines: string[] = [];
    for (const a of newAchievements) lines.push(`${a.icon} ${a.title}`);

    if (newBadges.length > 0) {
      const byState = new Map<string, BadgeId[]>();
      for (const key of newBadges) {
        const [state, id] = key.split(":") as [string, BadgeId];
        byState.set(state, [...(byState.get(state) ?? []), id]);
      }
      for (const [state, ids] of byState) {
        const names = ids
          .map((id) => `${BADGE_ICON[id]} ${STATE_BADGES.find((b) => b.id === id)?.name ?? id}`)
          .join(" · ");
        lines.push(`${EMOJI.achievement.badge} ${state}: ${names}`);
      }
    }

    const total = newAchievements.length + newBadges.length;
    const title =
      newAchievements.length > 0
        ? total > 1
          ? `${EMOJI.action.celebrate} ${total} new unlocks!`
          : `${newAchievements[0].icon} Achievement unlocked!`
        : `${EMOJI.achievement.badge} ${newBadges.length} new badge${newBadges.length > 1 ? "s" : ""}!`;

    const subtitle = lines.join("\n");

    console.log("[UnlockCelebration] FIRING celebration:", {
      title,
      itemCount: total,
      timestamp: new Date().toISOString(),
    });

    // Show celebration popup instead of toast
    celebration.achievement(title, {
      subtitle: subtitle || undefined,
      confetti: true,
      duration: 4500,
      action: {
        label: `Awesome! ${EMOJI.action.celebrate}`,
        onClick: () => {
          // Auto-dismissed by celebration system
        },
      },
    });

    // One burst per tick, never stacked.
    fxConfetti();
    burstRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPieces(makePieces(burstRef.current));
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPieces(null);
    }, 3200);
  }, [progress]);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-8%] rounded-[2px] confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--confetti-rotate" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
