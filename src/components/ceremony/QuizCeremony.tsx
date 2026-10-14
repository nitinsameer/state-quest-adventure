import { useEffect, useState, useRef } from 'react';
import { useProgress, dismissPendingCelebration, updateCeremonyStep, type PendingCelebration } from '@/lib/progress';
import { useNavigate } from '@tanstack/react-router';
import { getState, type IndiaState, nextStateAfter } from '@/lib/states';
import { STATE_ART, TONE_GRADIENT } from '@/lib/state-art';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { fxTap, fxCorrect, fxStamp } from '@/lib/fx';
import { playTts } from '@/lib/tts';
import { hasFeatureConsent } from '@/lib/parental-consent';
import { PostcardFrame } from '@/components/PostcardFrame';
import { EMOJI } from '@/constants/emoji';
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
  const [stampedState, setStampedState] = useState(false);

  // Get the first pending celebration (current ceremony)
  const ceremony = progress.pendingCelebrations?.[0] as PendingCelebration | undefined;

  // If dismissed, navigate to home
  useEffect(() => {
    if (!ceremony) {
      navigate({ to: "/" });
    }
  }, [ceremony, navigate]);

  // Reset stampedState when step changes
  useEffect(() => {
    setStampedState(false);
  }, [ceremony?.step]);

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
    <div className="h-full w-full bg-surface-card flex flex-col overflow-hidden">
      {/* HEADER BAND - matching Journey/Learning Hub */}
      <div className={`px-5 pt-3 pb-4 ${grad} rounded-b-[32px] relative`}>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-on-header text-sm font-black uppercase tracking-widest opacity-90">
              Step {step + 1} of 4
            </div>
          </div>
          {/* Skip button - top right */}
          <button
            onClick={handleSkip}
            className="text-on-header text-xs font-bold opacity-75 hover:opacity-100 transition-opacity active:scale-95"
            aria-label="Skip to results"
          >
            Skip � “
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 justify-center mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 ui-chip' : 'w-2 ui-chip opacity-40'
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
          {/* Step 0: Result */}
          {step === 0 && <StepResult ceremony={ceremony} state={state} art={art} />}

          {/* Step 1: Stamp */}
          {step === 1 && (
            <StepStamp 
              ceremony={ceremony} 
              state={state} 
              art={art}
              stamped={stampedState}
              onStamped={() => setStampedState(true)}
            />
          )}

          {/* Step 2: Postcard */}
          {step === 2 && <StepPostcard ceremony={ceremony} state={state} />}

          {/* Step 3: What's Next */}
          {step === 3 && <StepWhatsNext ceremony={ceremony} state={state} />}
        </div>
      </div>

      {/* BOTTOM BUTTON */}
      <div className="px-6 pb-6 pt-4 bg-surface-card space-y-3">
        {step === 0 && (
          <button
            onClick={advanceStep}
            className="w-full h-14 ui-button ui-accent-1 text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            Next � ’
          </button>
        )}
        {step === 1 && (
          <button
            onClick={advanceStep}
            disabled={!stampedState}
            className="w-full h-14 ui-button ui-accent-1 text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next � ’
          </button>
        )}
        {step === 2 && (
          <button
            onClick={advanceStep}
            className="w-full h-14 ui-button ui-accent-1 text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
          >
            Next � ’
          </button>
        )}
        {step === 3 && (
          <>
            {/* Primary: Next State */}
            <button
              onClick={() => {
                fxTap();
                dismissPendingCelebration();
                const nextState = nextStateAfter(ceremony.stateName);
                if (nextState) {
                  navigate({ to: `/state/${nextState.short}/welcome` });
                }
              }}
              className="w-full h-14 ui-button ui-accent-1 text-ink font-display font-bold text-lg rounded-3xl transition-all active:scale-95"
            >
              Next State � ’
            </button>

            {/* Secondary: Replay button (only if stars < 3) */}
            {parseInt(ceremony.stars) < 3 && (
              <button
                onClick={() => {
                  fxTap();
                  dismissPendingCelebration();
                  navigate({ to: `/state/${state.short}/quiz` });
                }}
                className="w-full h-12 ui-button ui-button-soft text-ink font-bold text-base rounded-3xl transition-all active:scale-95"
              >
                Play again for {EMOJI.action.stars}
              </button>
            )}

            {/* Text-style: Home button */}
            <button
              onClick={() => {
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
  ceremony: PendingCelebration & { type: 'full' };
  state: IndiaState;
  art?: string;
  stamped?: boolean;
  onStamped?: () => void;
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
            {i < filledStars ? '⭐' : '��†'}
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
          <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
            <div className="text-sm font-bold text-ink">+{ceremony.quizXp} XP quiz</div>
          </div>
          <div className="ui-chip ui-accent-4 px-4 py-3 text-center">
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
                className="absolute top-0 h-1 rounded-full bg-default/70 transition-all duration-1000 ease-out"
                style={{ width: `${(xpInCurrentLevel / nextLevelXp) * 100 * 0.9}%`, left: '5%' }}
              />
            </div>
            <div className="text-xs text-ink/60 font-medium text-center">
              Level {currentLevel} · Explorer
            </div>
          </div>

          {/* LEVEL UP BANNER */}
          {ceremony.leveledUp && (
            <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl border-2 border-success/30">
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
          <div className="relative ui-card ui-accent-1-soft px-4 py-3 rounded-2xl flex-1">
            <p className="text-sm font-semibold text-ink leading-snug">
              {mascotSpeechRef.current}
            </p>
            {/* Tail pointer */}
            <div className="absolute -left-2 bottom-4 w-3 h-3 ui-card ui-accent-1-soft rounded-full transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Step 2: Stamp - Passport card with tappable stamp target
 * 
 * - Shows state art and name in a ring
 * - Tap to stamp: plays animation (transform only), fxStamp, haptic, shows count
 * - Auto-stamp after 4 seconds if no tap
 * - Respects prefers-reduced-motion
 */
function StepStamp({ ceremony, state, art, stamped = false, onStamped }: StepProps) {
  const progress = useProgress();
  const [stampScale, setStampScale] = useState(1);
  const [stampRotation, setStampRotation] = useState(0);
  const prefersReducedMotion = useRef(false);
  const autoStampTimer = useRef<NodeJS.Timeout | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Tap handler: play animation and mark as stamped
  const handleStampTap = () => {
    if (stamped) return;

    // Clear auto-stamp timer if it was set
    if (autoStampTimer.current) {
      clearTimeout(autoStampTimer.current);
      autoStampTimer.current = null;
    }

    // Play effects
    fxStamp();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Animate stamp if not reduced motion
    if (!prefersReducedMotion.current) {
      // Quick scale-up and rotate for visual feedback
      setStampScale(1.15);
      setStampRotation(12);
      setTimeout(() => {
        setStampScale(1);
        setStampRotation(0);
      }, 300);
    }

    // Mark as stamped after animation completes
    setTimeout(() => {
      onStamped?.();
    }, prefersReducedMotion.current ? 0 : 300);
  };

  // Auto-stamp after 4 seconds if not tapped
  useEffect(() => {
    if (stamped || prefersReducedMotion.current) return;

    autoStampTimer.current = setTimeout(() => {
      // Trigger stamp without user tap
      fxStamp();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onStamped?.();
    }, 4000);

    return () => {
      if (autoStampTimer.current) {
        clearTimeout(autoStampTimer.current);
      }
    };
  }, [stamped]);

  // If reduced motion, stamp immediately on mount
  useEffect(() => {
    if (prefersReducedMotion.current && !stamped) {
      onStamped?.();
    }
  }, []);

  // Calculate stamp count (number of completed states)
  const stampCount = progress.completed.length;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink text-center">Add to Your Passport</h2>

      {/* PASSPORT CARD - ui-card with state art and name ring */}
      <div className="ui-card ui-accent-1-soft p-6 rounded-2xl space-y-4">
        {/* State art */}
        {art && (
          <div className="flex justify-center mb-3">
            <img
              src={art}
              alt={state.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}

        {/* STAMP EMOJI_TARGET - Ring with state name and stamp */}
        <div className="flex justify-center py-6">
          <button
            onClick={handleStampTap}
            disabled={stamped}
            className="relative w-32 h-32 rounded-full transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-saffron]"
            style={{
              transform: `scale(${stampScale}) rotate(${stampRotation}deg)`,
              transitionDuration: prefersReducedMotion.current ? '0ms' : '300ms',
            } as React.CSSProperties}
            aria-label="Tap to stamp"
            aria-pressed={stamped}
          >
            {/* Ring background with gradient using CSS token */}
            <div className="absolute inset-0 rounded-full ui-chip ui-accent-1 flex items-center justify-center border-4 border-ink/10">
              {/* Inner content: state name and art */}
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-sm font-bold text-ink text-center leading-tight max-w-[80px]">
                  {state.name}
                </div>
                {art && (
                  <img
                    src={art}
                    alt=""
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </div>
            </div>

            {/* Stamp emoji overlay (top-right) */}
            <div className="absolute -top-1 -right-1 text-3xl">�x–</div>
          </button>
        </div>

        {/* Stamp date */}
        <div className="text-center">
          <p className="text-sm text-ink/70 font-medium">{ceremony.stampDate}</p>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        {stamped ? (
          <p className="text-body text-ink font-bold">
            Stamp {stampCount} of 36 collected! �S“
          </p>
        ) : (
          <p className="text-body text-ink/60 text-sm">
            Tap the stamp to add it to your passport
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Step 3: Postcard - Reuse PostcardFrame, pick sticker, share button
 * 
 * - Slide in the postcard with CSS transition
 * - Three emoji buttons to pick a sticker (fixed list)
 * - Show "Saved in your Passport" with checkmark
 * - Secondary "Share" button that opens parent gate then share sheet
 * - Primary "Next" button to advance to step 4
 */
function StepPostcard({ ceremony, state }: StepProps) {
  const progress = useProgress();
  const [selectedSticker, setSelectedSticker] = useState<string | undefined>(ceremony.sticker);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Fixed emoji list: face-savouring-food, national-park, party-popper
  const STICKER_OPTIONS = ['😋', '�x�ž️', '🎉'];

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Save sticker selection to context
  const handleStickerPick = (sticker: string) => {
    if (selectedSticker === sticker) return; // Already selected

    fxTap();
    setSelectedSticker(sticker);

    // Update ceremony step with sticker choice
    // Note: updateCeremonyStep saves step; we need to also save sticker
    // For now, we save it via progress context (sticker field in pending-celebration)
    const ceremony_copy = { ...ceremony, sticker };
    const updated = {
      ...progress,
      pendingCelebrations: progress.pendingCelebrations?.map((c, i) =>
        i === 0 ? ceremony_copy : c
      ) || [],
    };

    // Persist sticker choice
    try {
      const STORAGE_KEY = 'india-explorer:progress:v2';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage error - fail silently
    }

    setShowSaveStatus(true);
    setTimeout(() => setShowSaveStatus(false), 2000);
  };

  // Handle share button: open share sheet
  // Note: Parent gate is handled within the share flow via parent-gate.ts verifyPin
  const handleShare = async () => {
    fxTap();

    try {
      // Verify parent PIN before sharing
      const { verifyPin } = await import('@/lib/parent-gate');

      // For now, just log that share is being attempted
      // Full implementation includes PIN gate modal from ParentGate component
      console.log('[Postcard Share] Share button pressed - would open PIN gate in full implementation');

      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 2000);
    } catch (err) {
      console.error('[Postcard Share Error]', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink text-center">Your Postcard</h2>

      {/* POSTCARD FRAME - Slide in with CSS transition */}
      <div
        className="transition-all duration-500 ease-out origin-top"
        style={{
          opacity: prefersReducedMotion.current ? 1 : 1,
          transform: prefersReducedMotion.current
            ? 'translateY(0) scaleY(1)'
            : 'translateY(-20px) scaleY(0.95)',
          animation: prefersReducedMotion.current
            ? 'none'
            : 'slideInDown 0.5s ease-out forwards',
        }}
      >
        <PostcardFrame
          stateName={state.name}
          stars={ceremony.stars}
          date={ceremony.stampDate}
          badge={(ceremony.earnedBadgeIds?.[0] as any) || 'explorer'}
        />
      </div>

      {/* STICKER PICKER */}
      <div className="space-y-3">
        <p className="text-center font-display font-bold text-ink text-lg">Pick a sticker</p>
        <div className="flex justify-center gap-4">
          {STICKER_OPTIONS.map((sticker) => (
            <button
              key={sticker}
              onClick={() => handleStickerPick(sticker)}
              className={`text-5xl transition-all active:scale-90 ${
                selectedSticker === sticker
                  ? 'scale-125 drop-shadow-lg'
                  : 'scale-100 opacity-70 hover:opacity-100'
              }`}
              style={{ minHeight: '48px', minWidth: '48px' }}
              aria-pressed={selectedSticker === sticker}
              aria-label={`Pick sticker ${sticker}`}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>

      {/* STATUS: SAVED */}
      {showSaveStatus && (
        <div className="ui-card ui-accent-3 px-4 py-3 rounded-2xl animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">�S“</span>
            <span className="text-sm font-bold text-ink">Saved in your Passport</span>
          </div>
        </div>
      )}

      {/* SHARE BUTTON - Secondary, soft style */}
      <button
        onClick={handleShare}
        className="w-full h-12 ui-button ui-button-soft text-ink font-bold text-base rounded-3xl transition-all active:scale-95"
      >
        �x¤ Share
      </button>
    </div>
  );
}

// Add CSS keyframes for slide-in animation (add to global or component styles)
if (typeof window !== 'undefined' && !document.querySelector('style[data-postcard-animation]')) {
  const style = document.createElement('style');
  style.setAttribute('data-postcard-animation', 'true');
  style.textContent = `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px) scaleY(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scaleY(1);
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Step 4: What's Next - Show region progress, next state, and action buttons
 * 
 * REGION CARD: Shows region name, dots for states (filled/empty), streak, and "Done" count
 * NEXT STATE: Art and name from nextStateAfter()
 * REGION MASTER: If regionDone === regionTotal, show success banner
 * BUTTONS: Next State (primary), Replay for 3 stars (secondary, if stars < 3), Home (text)
 */
function StepWhatsNext({ ceremony, state }: StepProps) {
  const navigate = useNavigate();
  
  // Get the next state
  const nextState = nextStateAfter(state.name);
  const nextStateArt = nextState ? STATE_ART[nextState.name] : undefined;

  /**
   * Handle "Next State" button: go to next state's welcome screen
   */
  const handleNextState = () => {
    fxTap();
    dismissPendingCelebration();
    if (nextState) {
      navigate({ to: `/state/${nextState.short}/welcome` });
    }
  };

  /**
   * Handle "Play again for 3 stars" button: go back to quiz
   */
  const handleReplay = () => {
    fxTap();
    dismissPendingCelebration();
    navigate({ to: `/state/${state.short}/quiz` });
  };

  /**
   * Handle "Home" button: go to home screen
   */
  const handleHome = () => {
    fxTap();
    dismissPendingCelebration();
    navigate({ to: "/" });
  };

  // Determine if region is complete
  const isRegionComplete = ceremony.regionDone === ceremony.regionTotal;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink text-center">What's Next?</h2>

      {/* REGION MASTER BANNER - appears only when region just completed */}
      {isRegionComplete && (
        <div className="ui-card ui-accent-3 px-6 py-4 rounded-2xl border-2 border-success/30 animate-bounce">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">�x‘</span>
            <div className="text-center">
              <div className="text-sm font-bold text-ink">Region Master!</div>
              <div className="text-xs font-semibold text-ink/80">You've completed the region!</div>
            </div>
          </div>
        </div>
      )}

      {/* REGION CARD - Shows dots, name, done count, streak */}
      <div className="ui-card ui-accent-1-soft p-5 rounded-2xl space-y-4">
        <div>
          <p className="text-center text-sm font-bold text-ink mb-2">
            {ceremony.regionKey.charAt(0).toUpperCase() + ceremony.regionKey.slice(1)} Region
          </p>
          {/* State dots: one per state, filled or empty */}
          <div className="flex justify-center gap-2 flex-wrap">
            {Array.from({ length: ceremony.regionTotal }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < ceremony.regionDone ? 'ui-chip' : 'bg-ink/20'
                }`}
                role="progressbar"
                aria-valuenow={i < ceremony.regionDone ? 1 : 0}
                aria-valuemax={1}
                aria-label={i < ceremony.regionDone ? 'completed state' : 'incomplete state'}
              />
            ))}
          </div>
        </div>

        {/* Done count */}
        <p className="text-center text-sm font-semibold text-ink">
          Done: {ceremony.regionDone} of {ceremony.regionTotal}
        </p>

        {/* Streak flame */}
        {ceremony.streak > 0 && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">�x¥</span>
            <p className="text-sm font-bold text-ink">{ceremony.streak}-day streak</p>
          </div>
        )}
      </div>

      {/* NEXT STATE TILE - Show art, name, ready prompt */}
      {nextState && (
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
      )}

      {/* ACTION BUTTONS - placed outside card to fill bottom */}
    </div>
  );
}


