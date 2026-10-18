/**
 * First Session Tutorial
 * 3-step interactive walkthrough for new users using StandardModal
 * - Step 1: How to read learning cards
 * - Step 2: How to take quizzes and earn XP
 * - Step 3: How to unlock new states
 *
 * Shows once per profile, can be skipped
 */

import { useState, useEffect } from "react";
import { fxTap } from "@/lib/fx";
import { StandardModal } from "@/components/StandardModal";
import { EMOJI } from "@/constants/emoji";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import mascot from "@/assets/mascot.webp";

export interface FirstSessionTutorialProps {
  onComplete?: () => void;
  isVisible?: boolean;
}

export function FirstSessionTutorial({ onComplete, isVisible = true }: FirstSessionTutorialProps) {
  const [step, setStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has already seen tutorial
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEYS.tutorialShown) === "1";
    setHasSeenTutorial(seen);
  }, []);

  if (hasSeenTutorial || !isVisible) {
    return null;
  }

  const handleSkip = () => {
    fxTap();
    localStorage.setItem(STORAGE_KEYS.tutorialShown, "1");
    setHasSeenTutorial(true);
    onComplete?.();
  };

  const handleNext = () => {
    fxTap();
    if (step === 2) {
      localStorage.setItem(STORAGE_KEYS.tutorialShown, "1");
      setHasSeenTutorial(true);
      onComplete?.();
    } else {
      setStep(step + 1);
    }
  };

  const steps = [
    {
      title: "Learn About States",
      emoji: EMOJI.learning.book,
      description: "Tap 'Play' to read fun facts about each state. Each fact is a card!",
      tips: [
        { emoji: EMOJI.audio.music, text: "Tap the speaker icon to hear the story" },
        { emoji: EMOJI.action.pointingFinger, text: "Swipe or tap to move to the next card" },
        { emoji: EMOJI.action.star, text: "Each card gives you 10 XP" },
      ],
      gradient: undefined,
    },
    {
      title: "Take Quizzes & Earn XP",
      emoji: EMOJI.quiz.question,
      description: "After reading all the cards, take the quiz! Answer correctly to earn big XP.",
      tips: [
        { emoji: EMOJI.action.checkButton, text: "Right answers give you 50 XP" },
        { emoji: EMOJI.feedback.encouragement, text: "You've got this! It's okay to learn" },
        { emoji: EMOJI.feedback.success, text: "Finish the quiz to complete the state" },
      ],
      gradient: undefined,
    },
    {
      title: "Unlock New States",
      emoji: EMOJI.nav.map,
      description:
        "Complete states to unlock the next adventure. Each state = 1 stamp for your passport!",
      tips: [
        { emoji: EMOJI.feedback.trophy, text: "Collect all 36 state stamps" },
        { emoji: EMOJI.action.fire, text: "Build a daily streak" },
        { emoji: EMOJI.achievement.badge, text: "Earn special badges" },
      ],
      gradient: undefined,
    },
  ];

  const current = steps[step];

  return (
    <StandardModal
      open={!hasSeenTutorial && isVisible}
      onClose={handleSkip}
      header={{
        icon: current.emoji,
        title: current.title,
      }}
      content={[
        {
          type: "custom",
          children: (
            <div className="flex items-center gap-(--gap-base) bg-accent-1-soft rounded-2xl p-(--padding-md) mb-(--space-0-25)">
              <img
                src={mascot}
                alt="Helper mascot"
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <p className="text-sm font-semibold text-accent-1-dark">{current.description}</p>
            </div>
          ),
        },
        ...current.tips.map((tip) => ({
          type: "bullet" as const,
          emoji: tip.emoji,
          text: tip.text,
        })),
        {
          type: "custom",
          className: "flex gap-(--gap-base) justify-center pt-(--padding-base)",
          children: (
            <div className="flex gap-(--gap-base) justify-center w-full">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === step ? "bg-ink w-6" : "bg-muted w-2"
                  }`}
                />
              ))}
            </div>
          ),
        },
      ]}
      buttons={[
        {
          label: "Skip",
          onClick: handleSkip,
          variant: "secondary",
        },
        {
          label: step === 2 ? `Got It! ${EMOJI.action.rocket}` : "Next →",
          onClick: handleNext,
          variant: "primary",
        },
      ]}
      footer={`${EMOJI.learning.funFact} You can always come back to learn more by tapping the state cards!`}
      maxWidth="max-w-sm"
    />
  );
}
