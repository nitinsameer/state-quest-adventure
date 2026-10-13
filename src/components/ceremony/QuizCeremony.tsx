import { useEffect, useState, useMemo } from 'react';
import { useProgress, dismissPendingCelebration, updateCeremonyStep, type PendingCelebration } from '@/lib/progress';
import { useNavigate } from '@tanstack/react-router';
import { getState, REGIONS, REGION_KEYS, type IndiaState } from '@/lib/states';
import { STATE_ART, TONE_GRADIENT } from '@/lib/state-art';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { fxTap } from '@/lib/fx';

/**
 * QuizCeremony: Four-step reward ceremony after quiz completion.
 * Steps: 0 = Result, 1 = Stamp, 2 = Postcard, 3 = What's Next
 * 
 * Persists step in pending-celebration context so resume works on app reopen.
 * Only calls dismissPendingCelebration on step 3's primary button.
 */
export function QuizCeremony() {
  const progress = useProgress();
  const navigate = useNavigate();

  // Get the first pending celebration (current ceremony)
  const ceremony = progress.pendingCelebrations?.[0] as PendingCelebration | undefined;

  // If dismissed, navigate to home
  useEffect(() => {
    if (!ceremony) {
      navigate({ to: "/" });
    }
  }, [ceremony, navigate]);

  // If no ceremony, render nothing (will navigate away)
  if (!ceremony || ceremony.type !== 'full') {
    return null;
  }

  const state = getState(ceremony.stateName);
  const grad = TONE_GRADIENT[state.tone] ?? 'gradient-saffron';
  const art = STATE_ART[state.name];
  const step = ceremony.step ?? 0;

  /**
   * Advance to next step; update pending-celebration through context.
   */
  const advanceStep = () => {
    fxTap();
    updateCeremonyStep(step + 1);
  };

  /**
   * Skip: jump to step 3 (What's Next) without discarding rewards.
   */
  const handleSkip = () => {
    fxTap();
    updateCeremonyStep(3);
  };

  /**
   * Handle final button on step 3: dismiss ceremony and go home.
   */
  const handleFinish = () => {
    fxTap();
    dismissPendingCelebration();
    // The useEffect will catch the change and navigate
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">
      {/* HEADER BAND - matching Journey/Learning Hub */}
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-white text-sm font-black uppercase tracking-widest opacity-90">
              Step {step + 1} of 4
            </div>
          </div>
          {/* Skip button - top right */}
          <button
            onClick={handleSkip}
            className="text-white text-xs font-bold opacity-75 hover:opacity-100 transition-opacity active:scale-95"
            aria-label="Skip to results"
          >
            Skip ↓
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 justify-center mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 clay-chip' : 'w-2 clay-chip opacity-40'
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
        <div className="clay-card clay-white w-full max-w-sm p-6 rounded-2xl">
          {/* Step 0: Result */}
          {step === 0 && <StepResult ceremony={ceremony} state={state} art={art} />}

          {/* Step 1: Stamp */}
          {step === 1 && <StepStamp ceremony={ceremony} state={state} />}

          {/* Step 2: Postcard */}
          {step === 2 && <StepPostcard ceremony={ceremony} state={state} />}

          {/* Step 3: What's Next */}
          {step === 3 && <StepWhatsNext ceremony={ceremony} state={state} />}
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="px-6 pb-6 pt-4 bg-[#F7F5F0]">
        {step < 3 ? (
          <button
            onClick={advanceStep}
            className="w-full h-14 clay-button clay-saffron text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full h-14 clay-button clay-saffron text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            All Done!
          </button>
        )}
      </div>
    </div>
  );
}

/* ========== STEP COMPONENTS ========== */

interface StepProps {
  ceremony: PendingCelebration & { type: 'full' };
  state: IndiaState;
  art?: string;
}

/**
 * Step 0: Result - Show stars, XP, and level up
 */
function StepResult({ ceremony, state, art }: StepProps) {
  const stars = parseInt(ceremony.stars);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    // Trigger confetti on mount
    setBurstKey(k => k + 1);
  }, []);

  const starMessages: Record<number, string> = {
    3: '3 stars! Amazing!',
    2: '2 stars! Great job!',
    1: '1 star! Good try!',
  };

  return (
    <div className="space-y-6">
      <ConfettiBurst trigger={burstKey} size="big" />

      {/* Title */}
      <h1 className="font-display text-2xl font-bold text-ink text-center">
        {ceremony.correctCount} of {ceremony.totalQuestions} right!
      </h1>

      {/* Stars */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-4xl" aria-label={i < stars ? 'earned star' : 'empty star'}>
            {i < stars ? '⭐' : '☆'}
          </div>
        ))}
      </div>

      {/* Star hint */}
      <p className="text-center text-body text-ink/70 text-sm">
        {ceremony.correctCount >= 6 ? '6+ right = 3 stars' : ceremony.correctCount >= 4 ? '4+ right = 2 stars' : 'Play again for more stars'}
      </p>

      {/* XP badges */}
      <div className="space-y-2">
        <div className="clay-chip clay-gold px-3 py-2 text-center">
          <div className="text-sm font-bold text-ink">+{ceremony.quizXp} XP quiz</div>
        </div>
        <div className="clay-chip clay-gold px-3 py-2 text-center">
          <div className="text-sm font-bold text-ink">+{ceremony.bonusXp} XP state bonus</div>
        </div>
      </div>

      {/* Level up banner (placeholder) */}
      {ceremony.leveledUp && (
        <div className="clay-card clay-success px-4 py-3 text-center">
          <div className="text-sm font-bold text-ink">New level: {ceremony.levelName}</div>
        </div>
      )}

      {/* Mascot message */}
      <div className="text-center text-sm text-ink/80">
        <div className="text-3xl mb-2">🎉</div>
        <p>{starMessages[stars]}</p>
      </div>
    </div>
  );
}

/**
 * Step 1: Stamp - Tap to stamp (placeholder)
 */
function StepStamp({ ceremony, state }: StepProps) {
  const [stamped, setStamped] = useState(false);
  const stampNumber = ceremony.stampDate; // Will be used later

  return (
    <div className="space-y-6 text-center">
      <h2 className="font-display text-2xl font-bold text-ink">Stamp Time!</h2>

      {/* Stamp target */}
      <div className="flex justify-center py-6">
        <button
          onClick={() => {
            if (!stamped) {
              setStamped(true);
              fxTap();
            }
          }}
          disabled={stamped}
          className="w-32 h-32 rounded-full clay-button clay-saffron text-5xl transition-transform active:scale-95 flex items-center justify-center"
          aria-label="Tap to stamp"
        >
          🔖
        </button>
      </div>

      {stamped && (
        <p className="text-body text-ink font-bold">
          Stamp {ceremony.stampDate} collected! ✓
        </p>
      )}

      {!stamped && (
        <p className="text-body text-ink/60 text-sm">
          Tap the stamp to add it to your passport
        </p>
      )}
    </div>
  );
}

/**
 * Step 2: Postcard - Pick sticker (placeholder)
 */
function StepPostcard({ ceremony, state }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="font-display text-2xl font-bold text-ink">Your Postcard</h2>

      {/* Postcard frame (placeholder) */}
      <div className="clay-card clay-white border-4 border-ink/10 p-4 rounded-2xl">
        <div className="text-6xl mb-2">📮</div>
        <p className="text-sm text-ink/60">{state.name}</p>
        <p className="text-xs text-ink/40 mt-1">{ceremony.stampDate}</p>
      </div>

      {/* Sticker picker (placeholder) */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-ink">Pick a sticker:</p>
        <div className="flex justify-center gap-4">
          <button className="text-4xl transition-transform active:scale-110">😋</button>
          <button className="text-4xl transition-transform active:scale-110">🏞️</button>
          <button className="text-4xl transition-transform active:scale-110">🎉</button>
        </div>
      </div>

      <p className="text-xs text-ink/60">Saved in your Passport ✓</p>
    </div>
  );
}

/**
 * Step 3: What's Next - Show next state and region progress
 */
function StepWhatsNext({ ceremony, state }: StepProps) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="font-display text-2xl font-bold text-ink">What's Next?</h2>

      {/* Region progress */}
      <div className="clay-chip clay-explorer px-4 py-3 text-center">
        <p className="text-sm font-bold text-ink">
          {ceremony.regionKey} Region: {ceremony.regionDone} of {ceremony.regionTotal}
        </p>
      </div>

      {/* Streak */}
      {ceremony.streak > 0 && (
        <div className="clay-chip clay-gold px-4 py-3 text-center">
          <p className="text-sm font-bold text-ink">
            🔥 {ceremony.streak}-day streak
          </p>
        </div>
      )}

      {/* Next state (placeholder) */}
      <div className="clay-card clay-white border-2 border-ink/10 p-4 rounded-2xl">
        <div className="text-5xl mb-2">🗺️</div>
        <p className="text-sm text-ink font-bold">Next State</p>
        <p className="text-xs text-ink/60 mt-1">Ready to explore?</p>
      </div>

      {/* Replay button if not 3 stars */}
      {parseInt(ceremony.stars) < 3 && (
        <button className="w-full clay-button clay-button-soft text-ink py-3 rounded-2xl text-sm font-bold transition-all active:scale-95">
          Play again for ⭐⭐⭐
        </button>
      )}
    </div>
  );
}
