/**
 * High-dopamine quiz answer feedback component
 *
 * Provides instant, rewarding feedback for quiz answers with:
 * - Visual animations (pop-in checkmark, wiggle for wrong)
 * - Confetti burst
 * - XP reward popup
 * - Sound effects
 * - Haptic feedback (vibration)
 *
 * Goal: Make kids FEEL rewarded for correct answers, encouraged for wrong ones
 */

import { useEffect, useState } from "react";
import { ConfettiBurst } from "./ConfettiBurst";
import { fxCorrect, fxWrong } from "../lib/fx";
import { EMOJI } from "@/constants/emoji";

interface QuizAnswerFeedbackProps {
  isCorrect: boolean;
  answer: string;
  correctAnswer?: string;
  xpReward?: number;
  onDismiss: () => void;
}

export function QuizAnswerFeedback({
  isCorrect,
  answer,
  correctAnswer,
  xpReward = 100,
  onDismiss,
}: QuizAnswerFeedbackProps) {
  const [show, setShow] = useState(true);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    // Trigger confetti immediately for correct answers
    if (isCorrect) {
      setConfettiTrigger(1);
    }

    // Auto-dismiss after 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isCorrect, onDismiss]);

  // Haptic feedback and sound effects
  useEffect(() => {
    if (isCorrect) {
      fxCorrect();
    } else {
      fxWrong();
    }
  }, [isCorrect]);

  if (!show) return null;

  return (
    <>
      {/* Confetti for correct answers */}
      {isCorrect && confettiTrigger > 0 && <ConfettiBurst trigger={confettiTrigger} size="big" />}

      {/* Full-screen feedback overlay */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
        {isCorrect ? (
          // ✅ CORRECT ANSWER - MAXIMUM DOPAMINE HIT
          <>
            {/* Large animated checkmark */}
            <div className="animate-pop-in text-9xl mb-8 drop-shadow-2xl">{EMOJI.action.checkButton}</div>

            {/* Success message with slide-up animation */}
            <div className="animate-slide-up text-center px-6">
              <h1 className="text-h1 font-bold text-success mb-2 drop-shadow-lg">
                Correct! {EMOJI.action.celebrate}
              </h1>
              <p className="text-body text-muted-foreground mb-4">Awesome work!</p>
            </div>

            {/* XP reward floating popup */}
            <div
              className="absolute top-1/3 animate-float-up text-5xl font-black text-accent-4 drop-shadow-lg"
              style={{ animation: "float-up 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
            >
              +{xpReward} XP {EMOJI.action.sparkle}
            </div>

            {/* Celebratory emoji rain */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-4xl animate-float-up"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: "50%",
                    animation: `float-up ${1 + i * 0.2}s ease-out forwards`,
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {
                    [
                      EMOJI.action.celebrate,
                      EMOJI.action.star,
                      EMOJI.feedback.sparkles,
                      EMOJI.action.sparkle,
                      EMOJI.action.sparkle,
                      EMOJI.feedback.newLevel,
                      EMOJI.feedback.trophy,
                      EMOJI.action.celebrate,
                    ][i]
                  }
                </div>
              ))}
            </div>
          </>
        ) : (
          // ❌ INCORRECT - ENCOURAGING, NOT HARSH
          <>
            {/* Thinking emoji with gentle jiggle */}
            <div className="animate-jiggle mb-6">
              <div className="text-8xl">{EMOJI.action.thinking}</div>
            </div>

            {/* Try-again message with slide-up */}
            <div className="animate-slide-up text-center px-6 max-w-md">
              <h2 className="text-h2 font-bold text-warning mb-3 drop-shadow-lg">Not quite...</h2>

              {correctAnswer && (
                <div className="mb-4 p-4 rounded-2xl bg-warning-soft border-2 border-warning">
                  <p className="text-body-sm text-muted-foreground mb-2">The correct answer is:</p>
                  <p className="text-body font-bold text-warning">{correctAnswer}</p>
                </div>
              )}

              <p className="text-body text-muted-foreground mb-2">
                {`Don't worry, you're learning! ${EMOJI.feedback.encouragement}`}
              </p>
              <p className="text-body-sm text-success">Try the next one!</p>
            </div>
          </>
        )}
      </div>

      {/* Sound effects - now handled by triggerFeedback */}
    </>
  );
}
