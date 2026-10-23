import { useEffect, useState, useRef } from "react";
import {
  useProgress,
  dismissPendingCelebration,
  type PendingCelebration,
  type BadgeId,
} from "@/lib/progress";
import { useNavigate } from "@tanstack/react-router";
import { getState, type IndiaState, nextStateAfter } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT } from "@/lib/state-art";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { fxTap, fxCorrect, fxStamp, fxConfetti } from "@/lib/fx";
import { hasFeatureConsent } from "@/lib/parental-consent";
import { PostcardFrame } from "@/components/PostcardFrame";
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";

/**
 * QuizCelebrationScreen: Single-screen dopamine-driven celebration with 5 sequential animation phases.
 *
 * Phases (5-6s total):
 * 1. Confetti burst + mascot bounce (0-0.3s)
 * 2. Stars light up 1-by-1 with particles (0.5-2.5s, 700ms apart)
 * 3. XP floats up with fade-in (2.5-3.5s)
 * 4. Postcard slides in from bottom, stickers appear inline (3.5-4.5s)
 * 5. Buttons slide in staggered (4.5s+, 100ms each)
 *
 * Features:
 * - Single RAF loop for all animations (no step state)
 * - Prefers-reduced-motion: instant reveal
 * - Skip button to jump to phase 5
 * - Audio integration with consent checks
 * - Inline sticker picker with localStorage persistence
 * - Accessibility: aria-live, aria-labels, skip support
 * - Performance: transform/opacity only, no reflows
 */
export function QuizCelebrationScreen() {
  const progress = useProgress();
  const navigate = useNavigate();
  const navigationInProgressRef = useRef(false);

  // Get the first pending celebration (current ceremony)
  const ceremony = progress.pendingCelebrations?.[0];

  // Type guard: only proceed if ceremony is valid "full" type
  const isValidCeremony = ceremony && ceremony.type === "full";

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY
  useEffect(() => {
    if (isValidCeremony === false && !navigationInProgressRef.current) {
      navigate({ to: "/" });
    }
  }, [isValidCeremony, navigate]);

  // Guard rendering: return null if ceremony is invalid
  if (!isValidCeremony) {
    return null;
  }

  // At this point, ceremony is guaranteed to be PendingCelebration with type "full"
  const typedCeremony = ceremony as PendingCelebration & { type: "full" };

  return (
    <SingleScreenCelebration
      ceremony={typedCeremony}
      navigationInProgressRef={navigationInProgressRef}
      navigate={navigate}
    />
  );
}

interface SingleScreenCelebrationProps {
  ceremony: PendingCelebration & { type: "full" };
  navigationInProgressRef: React.MutableRefObject<boolean>;
  navigate: ReturnType<typeof useNavigate>;
}

function SingleScreenCelebration({
  ceremony,
  navigationInProgressRef,
  navigate,
}: SingleScreenCelebrationProps) {
  const state = getState(ceremony.stateName);
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";
  const art = STATE_ART[state.name];

  // Animation state
  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState<string | undefined>(ceremony.sticker);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);

  const STICKER_OPTIONS = [EMOJI.quiz.sticker1, EMOJI.quiz.sticker2, EMOJI.action.celebrate];

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersReduced = window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      setPrefersReducedMotion(prefersReduced);
    }
  }, []);

  // RAF loop: track elapsed time for animation phases
  useEffect(() => {
    // Initialize on first render
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      setConfettiBurstKey(1);
    }

    const frame = (now: number) => {
      const start = startTimeRef.current!;
      const elapsed = now - start;

      if (prefersReducedMotion) {
        // Instant reveal: jump to end
        setElapsedMs(5000);
        return;
      }

      setElapsedMs(elapsed);

      // Continue animation loop until all phases complete
      if (elapsed < 5000) {
        requestAnimationFrame(frame);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion]);

  // Audio/haptics triggers on phase transitions
  useEffect(() => {
    if (prefersReducedMotion) return;

    const elapsed = elapsedMs;

    // Phase 1: Confetti (0ms)
    if (elapsed >= 0 && elapsed < 50) {
      if (hasFeatureConsent("audio")) {
        fxConfetti();
      }
    }

    // Phase 2: Star 1 (500ms)
    if (elapsed >= 500 && elapsed < 550) {
      if (hasFeatureConsent("audio")) {
        fxCorrect();
      }
    }

    // Star 2 (1200ms)
    if (elapsed >= 1200 && elapsed < 1250) {
      if (hasFeatureConsent("audio")) {
        fxCorrect();
      }
    }

    // Star 3 (1900ms)
    if (elapsed >= 1900 && elapsed < 1950) {
      if (hasFeatureConsent("audio")) {
        fxCorrect();
      }
    }

    // Victory fanfare if 3 stars (2500ms)
    if (elapsed >= 2500 && elapsed < 2550 && parseInt(ceremony.stars) === 3) {
      if (hasFeatureConsent("audio")) {
        fxConfetti();
      }
    }

    // Postcard seal sound (3500ms)
    if (elapsed >= 3500 && elapsed < 3550) {
      if (hasFeatureConsent("audio")) {
        fxStamp();
      }
    }
  }, [elapsedMs, ceremony.stars, prefersReducedMotion]);

  // Calculate animation progress for each phase
  const getPhaseProgress = (phaseStartMs: number, phaseDurationMs: number) => {
    if (prefersReducedMotion) return 1;
    const progress = (elapsedMs - phaseStartMs) / phaseDurationMs;
    return Math.max(0, Math.min(1, progress));
  };

  // Phase timing
  const phase1Progress = getPhaseProgress(0, 300); // 0-0.3s
  const phase2Progress = getPhaseProgress(500, 2000); // 0.5-2.5s
  const phase3Progress = getPhaseProgress(2500, 1000); // 2.5-3.5s
  const phase4Progress = getPhaseProgress(3500, 1000); // 3.5-4.5s
  const phase5Progress = getPhaseProgress(4500, 300); // 4.5s+

  const showPhase1 = phase1Progress > 0;
  const showPhase2 = phase2Progress > 0;
  const showPhase3 = phase3Progress > 0;
  const showPhase4 = phase4Progress > 0;
  const showPhase5 = phase5Progress > 0;

  // Star fill logic: 3 stars fill sequentially
  const stars = parseInt(ceremony.stars);
  const filledStars = Math.min(stars, Math.floor(phase2Progress * (stars + 1)));

  const handleSkip = () => {
    // Skip removed
  };

  const handleStickerPick = (sticker: string) => {
    // Sticker picker removed
  };

  const handleNavigate = (to: string, params?: { slug: string }) => {
    navigationInProgressRef.current = true;
    fxTap();
    dismissPendingCelebration();
    navigate({ to: to as any, params: params as any });
  };

  const handleNextState = () => {
    const nextState = nextStateAfter(ceremony.stateName);
    if (nextState) {
      handleNavigate("/state/$slug", { slug: nextState.short });
    } else {
      handleNavigate("/journey");
    }
  };

  const handlePlayAgain = () => {
    handleNavigate(`/state/${state.short}/quiz`);
  };

  const handleHome = () => {
    handleNavigate("/");
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col overflow-hidden">

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto relative">
        {/* PHASE 1: Confetti + Mascot bounce */}
        {showPhase1 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 1 - phase1Progress,
            }}
          >
            <ConfettiBurst trigger={confettiBurstKey} size="big" />
          </div>
        )}

        {/* Main content card */}
        <div className="ui-card ui-accent-1-soft w-full max-w-sm p-6 rounded-2xl space-y-6">
          {/* PHASE 1-2: Title and stars */}
          {showPhase2 && (
            <div
              className="transition-all duration-300"
              style={{
                opacity: Math.min(1, phase2Progress * 2),
              }}
            >
              <h1 className="font-display text-3xl font-bold text-ink text-center leading-tight">
                {ceremony.correctCount} of {ceremony.totalQuestions} right!
              </h1>
            </div>
          )}

          {/* PHASE 2: Stars with animation */}
          {showPhase2 && (
            <div
              className="flex justify-center gap-4"
              style={{
                opacity: Math.min(1, phase2Progress * 1.5),
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => {
                const starProgress = Math.max(
                  0,
                  Math.min(1, (phase2Progress - i * 0.35) / 0.35),
                );
                return (
                  <div
                    key={i}
                    className={`text-5xl transition-all`}
                    style={{
                      transform: `scale(${0.75 + starProgress * 0.25}) scaleY(${1 + starProgress * 0.1})`,
                      opacity: starProgress,
                    }}
                    aria-label={i < filledStars ? "earned star" : "empty star"}
                  >
                    {i < filledStars ? EMOJI.action.star : EMOJI.action.emptyStar}
                  </div>
                );
              })}
            </div>
          )}

          {/* Star hint */}
          {showPhase2 && (
            <p
              className="text-center text-body text-ink/70 text-sm font-medium transition-all"
              style={{
                opacity: Math.min(1, phase2Progress * 2),
              }}
            >
              {stars === 3
                ? "6 right = 3 stars"
                : stars === 2
                  ? "4 right = 2 stars"
                  : "Play again for more stars"}
            </p>
          )}

          {/* PHASE 3: XP floats up in a badge with animation */}
          {showPhase3 && (
            <div
              className="transition-all"
              style={{
                opacity: phase3Progress,
                transform: `translateY(${(1 - phase3Progress) * 40}px)`,
              }}
            >
              <div className="flex items-center justify-center">
                {/* Flying XP badge */}
                <div className="px-6 py-3 rounded-full bg-accent-3 shadow-lg animate-float">
                  <div className="text-h4 font-extrabold text-text-on-primary">
                    +{ceremony.quizXp + ceremony.bonusXp} XP
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 4: Postcard - simplified, no stickers or extra labels */}
          {showPhase4 && (
            <div
              className="transition-all"
              style={{
                opacity: phase4Progress,
                transform: `translateY(${(1 - phase4Progress) * 30}px)`,
              }}
            >
              {/* Postcard without sticker picker or extra labels */}
              <PostcardFrame
                stateName={state.name}
                stars={ceremony.stars}
                date={ceremony.stampDate}
                badge={(ceremony.earnedBadgeIds?.[0] as BadgeId) || "explorer"}
              />
            </div>
          )}
        </div>
      </div>

      {/* PHASE 5: Buttons in grid layout - 2 columns top row, full width bottom */}
      <div
        className="px-4 pb-6 pt-4 bg-surface-card grid grid-cols-2 gap-3 transition-all"
        style={{
          opacity: showPhase5 ? 1 : 0,
          transform: showPhase5 ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showPhase5 ? "auto" : "none",
        }}
      >
        {/* Home button - left */}
        <button
          onClick={handleHome}
          className="h-12 ui-button ui-accent-1-soft font-bold text-body rounded-2xl transition-all active:scale-95 animate-slide-up"
          style={{
            animationDelay: "0ms",
          }}
          aria-label="Return to Home"
        >
          {EMOJI.nav.home} Home
        </button>

        {/* Play Again button - right (if stars < 3) */}
        {parseInt(ceremony.stars) < 3 ? (
          <button
            onClick={handlePlayAgain}
            className="h-12 ui-button ui-accent-3 font-bold text-body rounded-2xl transition-all active:scale-95 animate-slide-up"
            style={{
              animationDelay: "100ms",
            }}
            aria-label="Replay Quiz"
          >
            {EMOJI.action.star} Play Again
          </button>
        ) : (
          <div></div> /* Empty slot if only 3 stars */
        )}

        {/* Next State button - full width, bottom row */}
        <button
          onClick={handleNextState}
          className="col-span-2 h-12 ui-button ui-accent-1 font-bold text-body rounded-2xl transition-all active:scale-95 animate-slide-up"
          style={{
            animationDelay: parseInt(ceremony.stars) < 3 ? "200ms" : "100ms",
          }}
          aria-label="Next State Navigation"
        >
          Next State →
        </button>
      </div>

      {/* Accessibility: screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-label="Celebration progress"
      >
        {filledStars > 0 && `Earned ${filledStars} star${filledStars > 1 ? "s" : ""}`}
        {showPhase3 && ` plus ${ceremony.quizXp + ceremony.bonusXp} XP`}
        {showPhase4 && " postcard earned"}
      </div>

      {/* Hidden styles for animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
