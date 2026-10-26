import { createFileRoute, notFound, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getStateBySlug } from "@/lib/states";
import { PlaceError, NotFoundPlace } from "@/components/PlaceFallbacks";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";
import {
  useProgress,
  getProgress,
  setLastPlayedState,
  dismissPendingCelebration,
  statesWithProgress,
  type BadgeId,
} from "@/lib/progress";
import { ThemeUnlockCelebration } from "@/components/ThemeUnlockCelebration";
import { questionCountForAgeBand } from "@/lib/quiz";
import { EMOJI } from "@/constants/emoji";

const BADGE_EMOJI: Record<BadgeId, string> = {
  monument: EMOJI.achievement.monument,
  animal: EMOJI.achievement.animal,
  explorer: EMOJI.achievement.explorer,
  "region-master-north": EMOJI.achievement.badge,
  "region-master-south": EMOJI.achievement.badge,
  "region-master-east": EMOJI.achievement.badge,
  "region-master-central": EMOJI.achievement.badge,
  "region-master-west": EMOJI.achievement.badge,
  "region-master-northeast": EMOJI.achievement.badge,
  "region-master-unionTerritories": EMOJI.achievement.badge,
};

const LAST_RESULT_KEY = "india-explorer:last-quiz-result";

type LastQuizResult = {
  stateName: string;
  correctCount: number;
  totalQuestions: number;
  quizXp: number;
  bonusXp: number;
};

function readLastQuizResult(stateName: string): LastQuizResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastQuizResult;
    if (parsed.stateName !== stateName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/state/$slug/quiz-done")({
  loader: ({ params }) => {
    const state = getStateBySlug(params.slug);
    if (!state) throw notFound();

    // Guard: only reachable once the state has actually been completed
    const progress = getProgress();
    if (!progress.completed.includes(state.name)) {
      throw redirect({ to: "/state/$slug/learn", params: { slug: params.slug } });
    }

    return { name: state.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — India Explorer" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} Complete! — India Explorer`;
    const description = `Awesome work! You completed the ${loaderData.name} quiz. Earn your passport stamp and badges.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: QuizDone,
  errorComponent: PlaceError,
  notFoundComponent: NotFoundPlace,
});

function QuizDone() {
  const { slug } = Route.useParams();
  const { name: stateName } = Route.useLoaderData();
  const navigate = useNavigate();
  const progress = useProgress();
  const [animateIn, setAnimateIn] = useState(false);
  const dismissedRef = useRef(false);

  // Trigger entrance animation on mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Clear the "full"/"stars-improved" celebration this quiz just queued so it
  // doesn't linger in the queue (which would suppress other achievement
  // popups and re-trigger a stray toast later on the Home screen).
  useEffect(() => {
    if (dismissedRef.current) return;
    const next = getProgress().pendingCelebrations?.[0];
    if (
      next &&
      (next.type === "full" || next.type === "stars-improved") &&
      next.stateName === stateName
    ) {
      dismissedRef.current = true;
      dismissPendingCelebration();
    }
  }, [stateName]);

  // Android back button: go to home
  useAndroidBackButton(() => {
    navigate({ to: "/home" });
  });

  const state = getStateBySlug(slug);
  const bestStars = parseInt(progress.stars?.[stateName] ?? "1", 10);
  const earnedBadges = progress.badges?.[stateName] ?? [];
  const totalQuestions = questionCountForAgeBand(progress.ageBand);

  // Exact numbers for *this* attempt, handed off from the quiz screen; fall
  // back to a sane default if that handoff is missing (e.g. direct nav).
  const lastResult = readLastQuizResult(stateName);
  const correctCount = lastResult?.correctCount ?? Math.round((bestStars / 3) * totalQuestions);
  const questionCount = lastResult?.totalQuestions ?? totalQuestions;
  const xpEarned = lastResult ? lastResult.quizXp + lastResult.bonusXp : null;

  const handleContinue = () => {
    navigate({ to: "/state/$slug/learn", params: { slug } });
  };

  const handleHome = () => {
    navigate({ to: "/home" });
  };

  const handleNextState = () => {
    const states = statesWithProgress(progress);
    const currentIndex = states.findIndex((s) => s.name === stateName);
    const nextState = states.slice(currentIndex + 1).find((s) => s.status !== "done");

    if (nextState) {
      setLastPlayedState(nextState.name);
      navigate({
        to: "/state/$slug/learn",
        params: { slug: nextState.name.toLowerCase().replace(/\s+/g, "-") },
      });
    } else {
      navigate({ to: "/journey" });
    }
  };

  // If a theme was unlocked by this completion, let its own modal show on
  // top — it manages and dismisses itself.
  const themeUnlock = progress.pendingCelebrations?.find((c) => c.type === "theme-unlock");

  return (
    <div className="h-screen w-full bg-surface-card flex flex-col items-center justify-center overflow-hidden relative">
      {themeUnlock && themeUnlock.type === "theme-unlock" && (
        <ThemeUnlockCelebration themeId={themeUnlock.themeId} themeName={themeUnlock.themeName} />
      )}

      {/* Confetti-like background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 rounded-full opacity-0 ${
              i % 3 === 0 ? "bg-accent-2" : i % 3 === 1 ? "bg-accent-3" : "bg-accent-4"
            }`}
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: animateIn ? `pop-burst ${0.6 + i * 0.05}s ease-out forwards` : "none",
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center px-6 max-w-sm transition-all duration-700 ${
          animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="text-8xl mb-6 inline-block animate-bounce">{EMOJI.action.celebrate}</div>

        <h1 className="text-h1 text-4xl font-black text-display mb-2">Awesome Work!</h1>

        <p className="text-h4 text-text-secondary mb-2">
          You completed {stateName}
          <br />
          and earned your passport stamp {EMOJI.action.stamp}
        </p>

        <p className="text-body text-text-secondary mb-6">
          {correctCount} of {questionCount} correct
        </p>

        {/* Achievement Summary */}
        <div className="bg-accent-3-soft/50 rounded-2xl p-6 mb-8 border-2 border-accent-3">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-black text-accent-3 mb-1">
                {xpEarned !== null ? `+${xpEarned}` : "⭐".repeat(bestStars)}
              </div>
              <div className="text-xs font-bold text-text-secondary uppercase">
                {xpEarned !== null ? "XP Earned" : "Best Stars"}
              </div>
            </div>
            <div className="w-px h-12 bg-accent-3/30" />
            <div className="text-center">
              <div className="text-3xl mb-1">
                {earnedBadges.length > 0
                  ? BADGE_EMOJI[earnedBadges[earnedBadges.length - 1]]
                  : EMOJI.action.star}
              </div>
              <div className="text-xs font-bold text-text-secondary uppercase">
                {earnedBadges.length > 0 ? "Badge Earned" : "Keep Going"}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full h-14 rounded-2xl bg-accent-3 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform"
          >
            {bestStars < 3 ? `Replay ${stateName}` : `Review ${stateName}`}
          </button>

          <button
            onClick={handleNextState}
            className="w-full h-14 rounded-2xl bg-accent-2 text-text-on-accent font-bold text-h4 active:scale-95 transition-transform"
          >
            Continue Journey {EMOJI.action.arrow}
          </button>

          <button
            onClick={handleHome}
            className="w-full h-14 rounded-2xl border-2 border-accent-1 text-accent-1 font-bold text-h4 active:scale-95 transition-transform"
          >
            Back to Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pop-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(60px, -60px) scale(0);
          }
        }
      `}</style>
    </div>
  );
}
