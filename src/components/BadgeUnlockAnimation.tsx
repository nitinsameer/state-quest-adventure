/**
 * Badge unlock celebration animation
 * 
 * Triggers when user unlocks a new badge:
 * - Animated reveal box (pop-in)
 * - Confetti burst
 * - Badge emoji bounce animation
 * - "Unlocked!" celebration message
 * 
 * Creates a memorable moment of achievement
 */

import { useEffect, useState } from 'react';
import { ConfettiBurst } from './ConfettiBurst';
import { fxStamp } from '../lib/fx';

interface BadgeUnlockAnimationProps {
  badgeName: string;
  badgeEmoji?: string;
  badgeDescription?: string;
  onComplete: () => void;
}

export function BadgeUnlockAnimation({
  badgeName,
  badgeEmoji = '🏅',
  badgeDescription,
  onComplete,
}: BadgeUnlockAnimationProps) {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'celebrate'>('intro');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    const timeline = [
      { stage: 'intro' as const, delay: 100 },
      { stage: 'reveal' as const, delay: 600 },
      { stage: 'celebrate' as const, delay: 1200 },
    ];

    timeline.forEach(({ stage, delay }) => {
      setTimeout(() => setStage(stage), delay);
    });

    // Trigger confetti on reveal
    setTimeout(() => setConfettiTrigger(1), 600);

    // Trigger unlock feedback
    setTimeout(() => fxStamp(), 600);

    // Complete animation after 2.5 seconds
    setTimeout(onComplete, 2500);
  }, [onComplete]);

  return (
    <>
      {/* Confetti burst on reveal */}
      {confettiTrigger > 0 && (
        <ConfettiBurst trigger={confettiTrigger} size="big" />
      )}

      {/* Glowing background for drama */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          stage === 'reveal' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-accent-2-soft/30 blur-3xl" />
      </div>

      {/* Badge reveal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative z-10 rounded-3xl bg-white shadow-2xl p-8 max-w-sm mx-4 transition-all duration-500 ${
            stage === 'intro'
              ? 'scale-0 opacity-0 rotate-180'
              : 'scale-100 opacity-100 rotate-0'
          }`}
        >
          {/* Animated border glow */}
          <div
            className={`absolute inset-0 rounded-3xl border-4 border-yellow-400 transition-all duration-300 ${
              stage === 'celebrate'
                ? 'animate-pulse'
                : ''
            }`}
          />

          {/* Badge emoji - bounces in celebrate stage */}
          <div
            className={`text-9xl text-center mb-6 transition-transform duration-500 ${
              stage === 'celebrate'
                ? 'animate-bounce-scale'
                : ''
            }`}
          >
            {badgeEmoji}
          </div>

          {/* Badge title */}
          <h2 className="text-h2 text-center font-bold text-ink mb-2">
            {badgeName}
          </h2>

          {/* Badge description */}
          {badgeDescription && (
            <p className="text-body text-center text-muted-foreground mb-4">
              {badgeDescription}
            </p>
          )}

          {/* "Unlocked!" celebration text - fades in at celebrate stage */}
          <div
            className={`text-center text-h5 font-bold text-success transition-opacity duration-300 ${
              stage === 'celebrate'
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          >
            ⭐ Unlocked! ⭐
          </div>
        </div>
      </div>
    </>
  );
}
