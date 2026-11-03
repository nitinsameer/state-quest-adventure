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
import { fxTap, fxConfetti, fxStamp } from "@/lib/fx";
import { hasFeatureConsent } from "@/lib/parental-consent";
import { PostcardFrame } from "@/components/PostcardFrame";
import { StarCelebration } from "@/components/ceremony/StarCelebration";
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";

/**
 * QuizCelebrationScreen: Premium high-dopamine celebration with 5 sequential phases.
 *
 * Phases (5-6s total):
 * 1. Confetti burst + fade in (0-0.4s)
 * 2. Stars MASSIVE with sparkles + rotations (0.2-2.0s, 700ms apart)
 * 3. XP reward badge (1.8-3.2s)
 * 4. Postcard slides in (3.2-4.2s)
 * 5. Buttons (Home + Continue) slide in 2-column (4.2s+)
 *
 * Features:
 * - MASSIVE stars (text-9xl) with pop animations
 * - Single XP display (no dual numbers)
 * - No stickers, no skip button
 * - Streak bonus recognition
 * - 2-column button layout
 * - Premium polish: glows, shadows, smooth animations
 * - Accessibility: aria-live, aria-labels
 * - Performance: CSS animations only
 */
export function QuizCelebrationScreen() {
  const progress = useProgress();
  const navigate = useNavigate();
  const navigationInProgressRef = useRef(false);

  const ceremony = progress.pendingCelebrations?.[0];
  const isValidCeremony = ceremony && ceremony.type === "full";

  useEffect(() => {
    if (isValidCeremony === false && !navigationInProgressRef.current) {
      // DEBUG: Log invalid ceremony state
      console.log("[QuizCelebrationScreen] Invalid ceremony, redirecting:", {
        hasCeremony: !!ceremony,
        ceremonyType: ceremony?.type,
        pendingCount: progress.pendingCelebrations?.length ?? 0,
      });
      
      // Fallback: go to home instead of leaving blank screen
      navigationInProgressRef.current = true;
      setTimeout(() => {
        navigate({ to: "/" });
      }, 100);
    }
  }, [isValidCeremony, navigate]);

  if (!isValidCeremony) {
    console.log("[QuizCelebrationScreen] Returning null, no valid ceremony");
    return null;
  }

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

  const startTimeRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);

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
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
      setConfettiBurstKey(1);
    }

    const frame = (now: number) => {
      const start = startTimeRef.current!;
      const elapsed = now - start;

      if (prefersReducedMotion) {
        setElapsedMs(5000);
        return;
      }

      setElapsedMs(elapsed);

      if (elapsed < 5000) {
        requestAnimationFrame(frame);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion]);

  // Calculate animation progress for each phase
  const getPhaseProgress = (phaseStartMs: number, phaseDurationMs: number) => {
    if (prefersReducedMotion) return 1;
    const progress = (elapsedMs - phaseStartMs) / phaseDurationMs;
    return Math.max(0, Math.min(1, progress));
  };

  const phase1Progress = getPhaseProgress(0, 400); // Confetti/fade in
  const phase3Progress = getPhaseProgress(1800, 1400); // XP badge
  const phase4Progress = getPhaseProgress(3200, 1000); // Postcard
  const phase5Progress = getPhaseProgress(4200, 300); // Buttons

  const showPhase1 = phase1Progress > 0;
  const showPhase3 = phase3Progress > 0;
  const showPhase4 = phase4Progress > 0;
  const showPhase5 = phase5Progress > 0;

  const handleNavigate = (to: string, params?: { slug: string }) => {
    navigationInProgressRef.current = true;
    fxTap();
    dismissPendingCelebration();
    navigate({ to: to as any, params: params as any });
  };

  const handleNextState = () => {
    const nextState = nextStateAfter(ceremony.stateName);
    if (nextState) {
      // Convert state name to slug format (lowercase, dash-separated)
      const slug = nextState.name.toLowerCase().replace(/\s+/g, "-");
      console.log("[Navigation] Next state:", nextState.name, "slug:", slug);
      handleNavigate("/state/$slug/learn", { slug });
    } else {
      // All states completed - go to journey
      console.log("[Navigation] No next state, going to journey");
      handleNavigate("/journey");
    }
  };

  const handleHome = () => {
    handleNavigate("/");
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col overflow-hidden">
      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-y-auto relative">
        {/* PHASE 1: Confetti burst */}
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
        <div className="ui-card ui-accent-1-soft w-full max-w-sm p-6 rounded-2xl space-y-4 relative">
          {/* Title - State name + Completed with confetti around */}
          {showPhase1 && (
            <div
              className="transition-all duration-300 text-center space-y-1"
              style={{
                opacity: Math.min(1, phase1Progress * 2),
              }}
            >
              {/* State name - bold black */}
              <h1 className="font-display text-2xl font-black text-text-primary leading-tight">
                {state.name}
              </h1>
              
              {/* Completed! with sparkles - large yellow/gold */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">✨</span>
                <h2 className="font-display text-3xl font-black leading-tight" style={{color: 'var(--accent-4)'}}>
                  Completed!
                </h2>
                <span className="text-xl">✨</span>
              </div>
            </div>
          )}

          {/* PHASE 2: Stars with particles - REDUCED SIZE */}
          <div
            style={{
              opacity: Math.min(1, elapsedMs / 400),
            }}
          >
            <StarCelebration
              stars={parseInt(ceremony.stars)}
              elapsedMs={elapsedMs}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {/* Achievement message - varies by star count */}
          {elapsedMs > 1500 && elapsedMs < 3500 && (
            <div className="text-center text-text-secondary font-semibold">
              {(() => {
                const stars = parseInt(ceremony.stars);
                if (stars === 3) return "Perfect! You mastered this quiz.";
                if (stars === 2) return "Excellent work! You're getting better.";
                return "Good start! Play again for more stars.";
              })()}
            </div>
          )}

          {/* PHASE 3: Single XP Reward Badge */}
          {showPhase3 && (
            <div
              className="transition-all flex justify-center"
              style={{
                opacity: phase3Progress,
                transform: `translateY(${(1 - phase3Progress) * 20}px)`,
              }}
            >
              <div className="ui-chip ui-accent-4 px-6 py-4 text-center rounded-2xl">
                <div className="text-3xl font-bold text-ink">
                  +{ceremony.quizXp + ceremony.bonusXp} XP 🚀
                </div>
              </div>

              {ceremony.leveledUp && (
                <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl border-2 border-success/30 mt-3">
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

          {/* PHASE 4: Postcard */}
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

              {/* New memory message */}
              <div className="text-center text-xs font-semibold mt-3 px-3 py-2 bg-accent-2/10 rounded-lg">
                <span>✨ A new memory added to your Explorer Passport! ✨</span>
              </div>

              {/* Streak bonus - appears during postcard phase */}
              {ceremony.streak > 0 && ceremony.streak % 7 === 0 && phase4Progress > 0.5 && (
                <div
                  className="ui-card ui-accent-2 px-4 py-3 rounded-2xl mt-3 text-center"
                  style={{
                    opacity: Math.max(0, (phase4Progress - 0.5) * 2),
                  }}
                >
                  <div className="text-lg mb-1">{EMOJI.action.fire}</div>
                  <div className="text-sm font-bold text-ink">
                    {ceremony.streak}-Day Streak!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PHASE 4.5: Next Adventure Preview */}
      {showPhase4 && (() => {
        const nextState = nextStateAfter(ceremony.stateName);
        if (!nextState) return null;
        
        const nextStateImage = STATE_ART[nextState.name];
        console.log("[QuizCelebration] Next state:", nextState.name, "Image:", nextStateImage);

        return (
          <div
            className="px-6 py-3 transition-all w-full"
            style={{
              opacity: phase4Progress > 0.6 ? 1 : 0,
            }}
          >
            <div className="flex gap-3 items-start">
              {/* Next state preview image */}
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-surface-card">
                {nextStateImage ? (
                  <img
                    src={nextStateImage}
                    alt={nextState.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {nextState.emoji}
                  </div>
                )}
              </div>
              {/* Next state info */}
              <div className="flex-1 pt-0.5">
                <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Next Adventure:
                </div>
                <h3 className="text-base font-bold text-text-primary mt-0.5">
                  {nextState.name}
                </h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  New places, new stories and six new challenges await!
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PHASE 5: Button Row (2 columns) */}
      <div
        className="px-6 pb-6 pt-3 bg-surface-card transition-all"
        style={{
          opacity: showPhase5 ? 1 : 0,
          transform: showPhase5 ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showPhase5 ? "auto" : "none",
        }}
      >
        {/* Two-column button layout */}
        <div className="flex gap-3 w-full">
          {/* Home Button (Secondary - outlined purple) - 35% width */}
          <button
            onClick={handleHome}
            className="w-2/5 h-12 font-bold text-sm rounded-full transition-all active:scale-95 animate-slide-up border-2 border-accent-1 text-accent-1 bg-transparent hover:bg-accent-1/5"
            style={{
              animationDelay: "0ms",
            }}
            aria-label="Return to Home"
          >
            Home
          </button>

          {/* Continue Your Journey Button (Primary - filled purple) - 65% width */}
          <button
            onClick={handleNextState}
            className="flex-1 h-12 font-bold text-xs rounded-full transition-all active:scale-95 animate-slide-up bg-accent-1 text-white hover:bg-accent-1/90"
            style={{
              animationDelay: "100ms",
            }}
            aria-label="Continue to Next State"
          >
            Continue →
          </button>
        </div>
      </div>

      {/* Accessibility: screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-label="Celebration progress"
      >
        {parseInt(ceremony.stars) > 0 && `Earned ${ceremony.stars} star${parseInt(ceremony.stars) > 1 ? "s" : ""}`}
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
