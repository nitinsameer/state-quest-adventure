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
    fxTap();
    if (prefersReducedMotion) return;
    setElapsedMs(5000); // Jump to end
  };

  const handleStickerPick = (sticker: string) => {
    if (selectedSticker === sticker) return;

    fxTap();
    setSelectedSticker(sticker);

    // Persist to localStorage immediately
    const ceremony_copy = { ...ceremony, sticker };
    const progress_copy = { ...progress };
    progress_copy.pendingCelebrations = (progress_copy.pendingCelebrations || []).map((c, i) =>
      i === 0 ? ceremony_copy : c,
    );

    try {
      const STORAGE_KEY = STORAGE_KEYS.progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress_copy));
    } catch {
      // Storage error - fail silently
    }
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
      {/* SKIP BUTTON - Always visible */}
      <div className={`absolute top-4 right-4 z-50 ${grad} rounded-full p-2`}>
        <button
          onClick={handleSkip}
          className="text-on-header text-xs font-bold opacity-75 hover:opacity-100 transition-opacity active:scale-95"
          aria-label="Skip to results"
        >
          Skip »
        </button>
      </div>

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

          {/* PHASE 3: XP chips float up */}
          {showPhase3 && (
            <div
              className="space-y-3 transition-all"
              style={{
                opacity: phase3Progress,
                transform: `translateY(${(1 - phase3Progress) * 20}px)`,
              }}
            >
              <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
                <div className="text-sm font-bold text-ink">+{ceremony.quizXp} XP quiz</div>
              </div>
              <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
                <div className="text-sm font-bold text-ink">+{ceremony.bonusXp} XP state bonus</div>
              </div>

              {ceremony.leveledUp && (
                <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl border-2 border-success/30">
                  <div className="text-center">
                    <div className="text-sm font-bold text-ink">
                      {EMOJI.action.celebrate} New level!
                    </div>
                    <div className="text-xs font-semibold text-ink/80 mt-1">
                      {ceremony.levelName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE 4: Postcard + Stickers */}
          {showPhase4 && (
            <div
              className="transition-all"
              style={{
                opacity: phase4Progress,
                transform: `translateY(${(1 - phase4Progress) * 30}px)`,
              }}
            >
              <PostcardFrame
                stateName={state.name}
                stars={ceremony.stars}
                date={ceremony.stampDate}
                badge={(ceremony.earnedBadgeIds?.[0] as BadgeId) || "explorer"}
              />

              {/* Stickers appear inline */}
              {phase4Progress > 0.5 && (
                <div
                  className="space-y-3 mt-6 transition-all"
                  style={{
                    opacity: Math.max(0, (phase4Progress - 0.5) * 2),
                  }}
                >
                  <p className="text-center font-display font-bold text-ink text-lg">Pick a sticker</p>
                  <div className="flex justify-center gap-4">
                    {STICKER_OPTIONS.map((sticker) => (
                      <button
                        key={sticker}
                        onClick={() => handleStickerPick(sticker)}
                        className={`text-5xl transition-all active:scale-90 ${
                          selectedSticker === sticker
                            ? "scale-125 drop-shadow-lg"
                            : "scale-100 opacity-70 hover:opacity-100"
                        }`}
                        style={{ minHeight: "48px", minWidth: "48px" }}
                        aria-label={`Select ${sticker} sticker`}
                      >
                        {sticker}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Streak and level-up badges */}
              {ceremony.streak > 0 && ceremony.streak % 7 === 0 && (
                <div className="ui-card ui-accent-2 px-4 py-3 rounded-2xl mt-4">
                  <div className="text-center">
                    <div className="text-lg mb-1">{EMOJI.action.fire}</div>
                    <div className="text-sm font-bold text-ink">{ceremony.streak}-Day Streak!</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PHASE 5: Buttons slide in staggered */}
      <div
        className="px-6 pb-6 pt-4 bg-surface-card space-y-3 transition-all"
        style={{
          opacity: showPhase5 ? 1 : 0,
          transform: showPhase5 ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showPhase5 ? "auto" : "none",
        }}
      >
        {/* Next State button */}
        <button
          onClick={handleNextState}
          className="w-full h-14 ui-button ui-accent-1 font-display font-bold text-lg rounded-3xl transition-all active:scale-95 animate-slide-up"
          style={{
            animationDelay: "0ms",
          }}
          aria-label="Next State Navigation"
        >
          Next State →
        </button>

        {/* Play Again button (if stars < 3) */}
        {parseInt(ceremony.stars) < 3 && (
          <button
            onClick={handlePlayAgain}
            className="w-full h-12 ui-button ui-button-soft font-bold text-base rounded-3xl transition-all active:scale-95 animate-slide-up"
            style={{
              animationDelay: "100ms",
            }}
            aria-label="Replay Quiz"
          >
            Play again for {EMOJI.action.star}
          </button>
        )}

        {/* Home button */}
        <button
          onClick={handleHome}
          className="w-full h-12 text-ink font-bold text-base rounded-3xl transition-all active:scale-95 hover:bg-ink/5 animate-slide-up"
          style={{
            animationDelay: parseInt(ceremony.stars) < 3 ? "200ms" : "100ms",
          }}
          aria-label="Return to Home"
        >
          Home
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

      {/* Hidden styles for slide-up animation */}
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
      `}</style>
    </div>
  );
}
