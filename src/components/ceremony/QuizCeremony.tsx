import { useEffect, useState, useRef } from "react";
import {
  useProgress,
  dismissPendingCelebration,
  updateCeremonyStep,
  type PendingCelebration,
  type BadgeId,
} from "@/lib/progress";
import { useNavigate } from "@tanstack/react-router";
import { getState, type IndiaState, nextStateAfter } from "@/lib/states";
import { STATE_ART, TONE_GRADIENT } from "@/lib/state-art";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { fxTap, fxCorrect } from "@/lib/fx";
import { hasFeatureConsent } from "@/lib/parental-consent";
import { PostcardFrame } from "@/components/PostcardFrame";
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";

/**
 * QuizCeremony: Three-step reward ceremony after quiz completion with auto-advance.
 * Steps: 0 = Victory Burst (3s auto), 1 = Rewards Summary (2s auto), 2 = Next Adventure (manual)
 *
 * Features:
 * - Auto-advance timers with skip button
 * - Confetti, stars, XP counter with sound
 * - Reward displays (badges, postcard, level-up)
 * - Next state navigation
 *
 * Persists step in pending-celebration context so resume works on app reopen.
 * Only calls dismissPendingCelebration on step 2's action buttons.
 */
export function QuizCeremony() {
  const progress = useProgress();
  const navigate = useNavigate();
  const navigationInProgressRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userInteractedStep1, setUserInteractedStep1] = useState(false);

  // Get the first pending celebration (current ceremony)
  const ceremony = progress.pendingCelebrations?.[0];

  // Type guard: only proceed if ceremony is valid "full" type
  const isValidCeremony = ceremony && ceremony.type === "full";

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY - before any guard checks
  // If dismissed, navigate to home ONLY if NOT already navigating via button
  useEffect(() => {
    if (isValidCeremony === false && !navigationInProgressRef.current) {
      navigate({ to: "/" });
    }
  }, [isValidCeremony, navigate]);

  // Reset interaction state when step changes (called unconditionally)
  useEffect(() => {
    setUserInteractedStep1(false);
    // Only meaningful if ceremony is valid, but hook must always be called
    if (isValidCeremony) {
      // Hook is set up correctly
    }
  }, [isValidCeremony]);

  // Auto-advance timer logic (called unconditionally)
  useEffect(() => {
    if (!isValidCeremony) {
      return; // Skip logic if ceremony is invalid
    }

    const typedCeremony = ceremony as PendingCelebration & { type: "full" };
    const currentStep = typedCeremony.step ?? 0;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let autoAdvanceMs = 0;

    if (currentStep === 0) {
      autoAdvanceMs = 3000;
    } else if (currentStep === 1 && !userInteractedStep1) {
      autoAdvanceMs = 2000;
    }

    if (autoAdvanceMs > 0) {
      timerRef.current = setTimeout(() => {
        updateCeremonyStep(currentStep + 1);
      }, autoAdvanceMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isValidCeremony, ceremony, userInteractedStep1]);

  // Guard rendering: return null if ceremony is invalid
  // (hooks are already called above, so this is safe)
  if (!isValidCeremony) {
    return null;
  }

  // At this point, ceremony is guaranteed to be PendingCelebration with type "full"
  const typedCeremony = ceremony as PendingCelebration & { type: "full" };
  const currentStep = typedCeremony.step ?? 0;

  const state = getState(ceremony.stateName);
  const grad = TONE_GRADIENT[state.tone] ?? "var(--accent-1)";
  const art = STATE_ART[state.name];
  const step = currentStep;

  const advanceStep = () => {
    fxTap();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    updateCeremonyStep(step + 1);
  };

  const handleSkip = () => {
    fxTap();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    updateCeremonyStep(2);
  };

  const handleStep1Interaction = () => {
    setUserInteractedStep1(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="h-full w-full bg-surface-card flex flex-col overflow-hidden">
      {/* HEADER BAND */}
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-on-header text-sm font-black uppercase tracking-widest opacity-90">
              Step {step + 1} of 3
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-on-header text-xs font-bold opacity-75 hover:opacity-100 transition-opacity active:scale-95"
            aria-label="Skip to next adventure"
          >
            Skip »
          </button>
        </div>

        {/* Step dots - 3 dots */}
        <div className="flex gap-2 justify-center mt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-6 ui-chip" : "w-2 ui-chip opacity-40"
              }`}
              role="progressbar"
              aria-valuenow={i === step ? 1 : 0}
              aria-valuemax={1}
            />
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="ui-card ui-accent-1-soft w-full max-w-sm p-6 rounded-2xl">
          {step === 0 && <StepVictoryBurst ceremony={ceremony} state={state} art={art} />}
          {step === 1 && (
            <StepRewardsSummary
              ceremony={ceremony}
              state={state}
              onInteract={handleStep1Interaction}
            />
          )}
          {step === 2 && (
            <StepNextAdventure ceremony={ceremony} state={state} navigate={navigate} />
          )}
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="px-6 pb-6 pt-4 bg-surface-card space-y-3">
        {step === 0 && (
          <button
            onClick={advanceStep}
            className="w-full h-14 ui-button ui-accent-1 font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            Next →
          </button>
        )}
        {step === 1 && (
          <button
            onClick={() => {
              handleStep1Interaction();
              advanceStep();
            }}
            className="w-full h-14 ui-button ui-accent-1 font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            Next →
          </button>
        )}
        {step === 2 && (
          <>
            <button
              onClick={() => {
                navigationInProgressRef.current = true;
                fxTap();
                dismissPendingCelebration();
                const nextState = nextStateAfter(ceremony.stateName);
                if (nextState) {
                  navigate({ to: "/state/$slug", params: { slug: nextState.short } });
                } else {
                  navigate({ to: "/journey" });
                }
              }}
              className="w-full h-14 ui-button ui-accent-1 font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
            >
              Next State →
            </button>

            {parseInt(ceremony.stars) < 3 && (
              <button
                onClick={() => {
                  navigationInProgressRef.current = true;
                  fxTap();
                  dismissPendingCelebration();
                  navigate({ to: `/state/${state.short}/quiz` });
                }}
                className="w-full h-12 ui-button ui-button-soft font-bold text-base rounded-3xl transition-all active:scale-95"
              >
                Play again for {EMOJI.action.star}
              </button>
            )}

            <button
              onClick={() => {
                navigationInProgressRef.current = true;
                fxTap();
                dismissPendingCelebration();
                navigate({ to: "/" });
              }}
              className="w-full h-12 text-ink font-bold text-base rounded-3xl transition-all active:scale-95 hover:bg-ink/5"
            >
              Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ========== STEP COMPONENTS ========== */

interface StepProps {
  ceremony: PendingCelebration & { type: "full" };
  state: IndiaState;
  art?: string;
}

/**
 * Step 0: Victory Burst - Celebration with stars, confetti, and XP
 */
function StepVictoryBurst({ ceremony, state, art }: StepProps) {
  const progress = useProgress();
  const stars = parseInt(ceremony.stars);
  const [burstKey, setBurstKey] = useState(0);
  const [filledStars, setFilledStars] = useState(0);
  const [xpChipsShown, setXpChipsShown] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  // Trigger confetti on mount
  useEffect(() => {
    setBurstKey((k) => k + 1);
    // Play celebration sound on mount
    if (!prefersReducedMotion.current && hasFeatureConsent("audio")) {
      fxCorrect();
    }
  }, []);

  // Star animation: fill one at a time, 400ms apart
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setFilledStars(stars);
      setXpChipsShown(true);
      return;
    }

    if (filledStars < stars) {
      const timer = setTimeout(() => {
        if (hasFeatureConsent("audio")) {
          fxCorrect();
        }
        setFilledStars(filledStars + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (filledStars === stars && !xpChipsShown) {
      const timer = setTimeout(() => {
        setXpChipsShown(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filledStars, stars, xpChipsShown]);

  const totalXp = progress.xp;
  const currentLevel = Math.floor(totalXp / 400);
  const xpInCurrentLevel = totalXp % 400;
  const nextLevelXp = 400;

  const starHintMessages: Record<number, string> = {
    3: "6 right = 3 stars",
    2: "4 right = 2 stars",
    1: "Play again for more stars",
  };

  return (
    <div className="space-y-6">
      <ConfettiBurst trigger={burstKey} size="big" />

      <h1 className="font-display text-3xl font-bold text-ink text-center leading-tight">
        {ceremony.correctCount} of {ceremony.totalQuestions} right!
      </h1>

      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`text-5xl transition-all duration-300 ${
              i < filledStars ? "scale-100 opacity-100" : "scale-75 opacity-40"
            }`}
            aria-label={i < filledStars ? "earned star" : "empty star"}
          >
            {i < filledStars ? EMOJI.action.star : EMOJI.action.emptyStar}
          </div>
        ))}
      </div>

      <p className="text-center text-body text-ink/70 text-sm font-medium">
        {starHintMessages[stars]}
      </p>

      {xpChipsShown && (
        <div className="space-y-3 animate-fade-in">
          <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
            <div className="text-sm font-bold text-ink">+{ceremony.quizXp} XP quiz</div>
          </div>
          <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
            <div className="text-sm font-bold text-ink">+{ceremony.bonusXp} XP state bonus</div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="relative h-4 w-full rounded-full bg-ink/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(xpInCurrentLevel / nextLevelXp) * 100}%`,
                  backgroundColor: "var(--accent-4)",
                }}
              />
            </div>
            <div className="text-xs text-ink/60 font-medium text-center">
              Level {currentLevel} · Explorer
            </div>
          </div>

          {ceremony.leveledUp && (
            <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl border-2 border-success/30">
              <div className="text-center">
                <div className="text-sm font-bold text-ink">
                  {EMOJI.action.celebrate} New level!
                </div>
                <div className="text-xs font-semibold text-ink/80 mt-1">{ceremony.levelName}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Step 1: Rewards Summary - Show postcard, badges, and level-up
 */
function StepRewardsSummary({
  ceremony,
  state,
  onInteract,
}: StepProps & { onInteract: () => void }) {
  const progress = useProgress();
  const [selectedSticker, setSelectedSticker] = useState<string | undefined>(ceremony.sticker);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const prefersReducedMotion = useRef(false);

  const STICKER_OPTIONS = [EMOJI.quiz.sticker1, EMOJI.quiz.sticker2, EMOJI.action.celebrate];

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const handleStickerPick = (sticker: string) => {
    if (selectedSticker === sticker) return;

    fxTap();
    onInteract();
    setSelectedSticker(sticker);

    const ceremony_copy = { ...ceremony, sticker };
    const updated = {
      ...progress,
      pendingCelebrations:
        progress.pendingCelebrations?.map((c, i) => (i === 0 ? ceremony_copy : c)) || [],
    };

    try {
      const STORAGE_KEY = STORAGE_KEYS.progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage error - fail silently
    }

    setShowSaveStatus(true);
    setTimeout(() => setShowSaveStatus(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink text-center">Rewards Earned!</h2>

      <div
        className="transition-all duration-500 ease-out"
        style={{
          opacity: 1,
          transform: prefersReducedMotion.current ? "translateY(0)" : "translateY(-20px)",
        }}
      >
        <PostcardFrame
          stateName={state.name}
          stars={ceremony.stars}
          date={ceremony.stampDate}
          badge={(ceremony.earnedBadgeIds?.[0] as BadgeId) || "explorer"}
        />
      </div>

      {ceremony.leveledUp && (
        <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl border-2 border-success/30">
          <div className="text-center">
            <div className="text-sm font-bold text-ink">{EMOJI.action.celebrate} New level!</div>
            <div className="text-xs font-semibold text-ink/80 mt-1">{ceremony.levelName}</div>
          </div>
        </div>
      )}

      {ceremony.streak > 0 && ceremony.streak % 7 === 0 && (
        <div className="ui-card ui-accent-2 px-4 py-3 rounded-2xl">
          <div className="text-center">
            <div className="text-lg mb-1">{EMOJI.action.fire}</div>
            <div className="text-sm font-bold text-ink">{ceremony.streak}-Day Streak!</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
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
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>

      {showSaveStatus && (
        <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">✓</span>
            <span className="text-sm font-bold text-ink">Saved!</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Step 2: Next Adventure - Show next state and action buttons
 */
function StepNextAdventure({
  ceremony,
  state,
  navigate,
}: StepProps & { navigate: ReturnType<typeof useNavigate> }) {
  const nextState = nextStateAfter(state.name);
  const nextStateArt = nextState ? STATE_ART[nextState.name] : undefined;
  const isRegionComplete = ceremony.regionDone === ceremony.regionTotal;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink text-center">What's Next?</h2>

      {isRegionComplete && (
        <div className="ui-card ui-accent-3 px-6 py-4 rounded-2xl border-2 border-success/30">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{EMOJI.feedback.trophy}</span>
            <div className="text-center">
              <div className="text-sm font-bold text-ink">Region Master!</div>
              <div className="text-xs font-semibold text-ink/80">You've completed the region!</div>
            </div>
          </div>
        </div>
      )}

      <div className="ui-card ui-accent-1-soft p-5 rounded-2xl space-y-4">
        <div>
          <p className="text-center text-sm font-bold text-ink mb-2">
            {ceremony.regionKey.charAt(0).toUpperCase() + ceremony.regionKey.slice(1)} Region
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {Array.from({ length: ceremony.regionTotal }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < ceremony.regionDone ? "ui-chip" : "bg-ink/20"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-sm font-semibold text-ink">
          Done: {ceremony.regionDone} of {ceremony.regionTotal}
        </p>

        {ceremony.streak > 0 && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">{EMOJI.action.fire}</span>
            <p className="text-sm font-bold text-ink">{ceremony.streak}-day streak</p>
          </div>
        )}
      </div>

      {nextState ? (
        <div className="ui-card ui-accent-1-soft p-4 rounded-2xl space-y-3 border-2 border-ink/10">
          <div className="text-center">
            <p className="text-xs uppercase font-bold text-ink/60 mb-2">Ready to explore?</p>
            <p className="text-lg font-display font-bold text-ink mb-3">{nextState.name}</p>
            {nextStateArt && (
              <img
                src={nextStateArt}
                alt={nextState.name}
                className="w-20 h-20 object-cover rounded-lg mx-auto"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="ui-card ui-accent-3 px-6 py-4 rounded-2xl border-2 border-success/30 text-center">
          <p className="text-sm font-bold text-ink">All states explored!</p>
          <p className="text-xs text-ink/70 mt-1">Great work, explorer!</p>
        </div>
      )}
    </div>
  );
}
