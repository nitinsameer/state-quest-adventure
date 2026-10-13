import { useEffect, useState, useRef } from 'react';
import { useProgress, dismissPendingCelebration, updateCeremonyStep, type PendingCelebration } from '@/lib/progress';
import { useNavigate } from '@tanstack/react-router';
import { getState, type IndiaState } from '@/lib/states';
import { STATE_ART, TONE_GRADIENT } from '@/lib/state-art';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { fxTap, fxCorrect } from '@/lib/fx';
import { playTts } from '@/lib/tts';
import { hasFeatureConsent } from '@/lib/parental-consent';
import mascot from '@/assets/mascot.webp';

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
 * 
 * ANIMATION FLOW:
 * 1. Stars fill one at a time, 400ms apart, with fxCorrect haptic per star
 * 2. Respect prefers-reduced-motion: show all stars immediately
 * 3. XP chips appear after stars
 * 4. Confetti plays on mount
 * 5. Mascot speaks with TTS if narration is enabled
 */
function StepResult({ ceremony, state, art }: StepProps) {
  const progress = useProgress();
  const stars = parseInt(ceremony.stars);
  const [burstKey, setBurstKey] = useState(0);
  const [filledStars, setFilledStars] = useState(0);
  const [xpChipsShown, setXpChipsShown] = useState(false);
  const prefersReducedMotion = useRef(false);
  const mascotSpeechRef = useRef<string>('');

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Trigger confetti on mount
  useEffect(() => {
    setBurstKey(k => k + 1);
  }, []);

  // Star animation: fill one at a time, 400ms apart
  useEffect(() => {
    if (prefersReducedMotion.current) {
      // Show all stars immediately if reduced motion is enabled
      setFilledStars(stars);
      setXpChipsShown(true);
      return;
    }

    if (filledStars < stars) {
      const timer = setTimeout(() => {
        fxCorrect();
        setFilledStars(filledStars + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else if (filledStars === stars && !xpChipsShown) {
      // Show XP chips after all stars are filled
      const timer = setTimeout(() => {
        setXpChipsShown(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [filledStars, stars, xpChipsShown]);

  // Mascot speech messages based on stars
  const starMessages: Record<number, string> = {
    3: 'Three stars! Amazing!',
    2: 'Great job!',
    1: 'Good try! Play again for more stars.',
  };

  mascotSpeechRef.current = starMessages[stars];

  // Read mascot speech aloud if narration is enabled
  useEffect(() => {
    const shouldNarrate = hasFeatureConsent('audio');
    if (shouldNarrate && prefersReducedMotion.current === false) {
      // Add a small delay for immersion after star animation
      const timer = setTimeout(() => {
        playTts(
          `ceremony-step-1-mascot-${stars}`,
          mascotSpeechRef.current,
          { language: 'en-IN', speed: 0.9, pitch: 1.1 }
        );
      }, 2000); // After stars finish animating
      return () => clearTimeout(timer);
    }
  }, [stars]);

  // Calculate current level and XP progress
  const totalXp = progress.xp;
  const currentLevel = Math.floor(totalXp / 400);
  const xpInCurrentLevel = totalXp % 400;
  const nextLevelXp = 400;

  const starHintMessages: Record<number, string> = {
    3: '6 right = 3 stars',
    2: '4 right = 2 stars',
    1: 'Play again for more stars',
  };

  return (
    <div className="space-y-6">
      <ConfettiBurst trigger={burstKey} size="big" />

      {/* HEADLINE */}
      <h1 className="font-display text-3xl font-bold text-ink text-center leading-tight">
        {ceremony.correctCount} of {ceremony.totalQuestions} right!
      </h1>

      {/* STARS - Fill one at a time with animation */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`text-5xl transition-all duration-300 ${
              i < filledStars ? 'scale-100 opacity-100' : 'scale-75 opacity-40'
            }`}
            role="progressbar"
            aria-valuenow={i < filledStars ? 1 : 0}
            aria-valuemax={1}
            aria-label={i < filledStars ? 'earned star' : 'empty star'}
          >
            {i < filledStars ? '⭐' : '☆'}
          </div>
        ))}
      </div>

      {/* STAR HINT */}
      <p className="text-center text-body text-ink/70 text-sm font-medium">
        {starHintMessages[stars]}
      </p>

      {/* XP CHIPS - Appear after stars with animation */}
      {xpChipsShown && (
        <div className="space-y-3 animate-fade-in">
          <div className="clay-chip clay-gold px-4 py-3 text-center">
            <div className="text-sm font-bold text-ink">+{ceremony.quizXp} XP quiz</div>
          </div>
          <div className="clay-chip clay-gold px-4 py-3 text-center">
            <div className="text-sm font-bold text-ink">+{ceremony.bonusXp} XP state bonus</div>
          </div>

          {/* XP PROGRESS BAR - Reuse Home XP styling */}
          <div className="mt-4 space-y-2">
            <div className="relative h-4 w-full rounded-full bg-ink/10 overflow-hidden">
              <div
                className="h-full rounded-full gradient-gold transition-all duration-1000 ease-out"
                style={{ width: `${(xpInCurrentLevel / nextLevelXp) * 100}%` }}
              />
              <div
                className="absolute top-0 h-1 rounded-full bg-white/70 transition-all duration-1000 ease-out"
                style={{ width: `${(xpInCurrentLevel / nextLevelXp) * 100 * 0.9}%`, left: '5%' }}
              />
            </div>
            <div className="text-xs text-ink/60 font-medium text-center">
              Level {currentLevel} · Explorer
            </div>
          </div>

          {/* LEVEL UP BANNER */}
          {ceremony.leveledUp && (
            <div className="clay-card clay-success px-4 py-3 rounded-2xl border-2 border-green-200/50">
              <div className="text-center">
                <div className="text-sm font-bold text-ink">🎉 New level!</div>
                <div className="text-xs font-semibold text-ink/80 mt-1">{ceremony.levelName}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MASCOT WITH SPEECH BUBBLE */}
      {xpChipsShown && (
        <div className="flex items-start gap-3 mt-6 animate-fade-in">
          <img
            src={mascot}
            alt="Mascot"
            className="w-16 h-16 object-contain flex-shrink-0 mascot-cheer"
          />
          <div className="relative clay-card clay-white px-4 py-3 rounded-2xl flex-1">
            <p className="text-sm font-semibold text-ink leading-snug">
              {mascotSpeechRef.current}
            </p>
            {/* Tail pointer */}
            <div className="absolute -left-2 bottom-4 w-3 h-3 clay-card clay-white rounded-full transform rotate-45" />
          </div>
        </div>
      )}
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
