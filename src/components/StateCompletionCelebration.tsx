/**
 * State completion celebration animation
 *
 * Triggers when user completes all cards in a state:
 * - Animated celebration card (pop-in)
 * - Staggered badge grid reveal
 * - XP reward display (float-up)
 * - Confetti burst
 * - Achievement summary
 *
 * Creates a premium, rewarding moment of accomplishment
 */

import { useEffect, useState } from "react";
import { ConfettiBurst } from "./ConfettiBurst";
import { fxConfetti, fxCorrect } from "../lib/fx";
import { EMOJI } from "@/constants/emoji";

interface Badge {
  id: string;
  name: string;
  emoji: string;
}

interface StateCompletionCelebrationProps {
  stateName: string;
  stateEmoji?: string;
  badges: Badge[];
  totalXpGained: number;
  cardsCompleted: number;
  onComplete: () => void;
}

export function StateCompletionCelebration({
  stateName,
  stateEmoji = EMOJI.nav.map,
  badges,
  totalXpGained,
  cardsCompleted,
  onComplete,
}: StateCompletionCelebrationProps) {
  const [stage, setStage] = useState<"intro" | "reveal" | "celebrate">("intro");
  const [revealedBadges, setRevealedBadges] = useState<Set<string>>(new Set());
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    // Play celebration sound immediately on mount
    fxCorrect();
  }, []);

  useEffect(() => {
    // Timeline for animation stages
    const stageTimeline = [
      { stage: "intro" as const, delay: 100 },
      { stage: "reveal" as const, delay: 700 },
      { stage: "celebrate" as const, delay: 1500 },
    ];

    stageTimeline.forEach(({ stage, delay }) => {
      setTimeout(() => setStage(stage), delay);
    });

    // Trigger confetti on reveal
    setTimeout(() => setConfettiTrigger(1), 700);

    // Trigger achievement feedback
    setTimeout(() => fxConfetti(), 700);

    // Stagger badge reveals (starting at reveal stage)
    const revealed = new Set<string>();
    badges.forEach((badge, index) => {
      setTimeout(
        () => {
          revealed.add(badge.id);
          setRevealedBadges(new Set(revealed));
        },
        700 + index * 150,
      );
    });

    // Complete animation after 4 seconds
    const completeTimer = setTimeout(onComplete, 4000);
    return () => clearTimeout(completeTimer);
  }, [badges, onComplete]);

  return (
    <>
      {/* Confetti burst on reveal */}
      {confettiTrigger > 0 && <ConfettiBurst trigger={confettiTrigger} size="big" />}

      {/* Animated glowing background */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          stage === "reveal" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-accent-2-soft blur-3xl" />
      </div>

      {/* Main celebration card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`relative z-10 rounded-3xl bg-action-primary shadow-lg p-8 max-w-xl mx-4 transition-all duration-500 ${
            stage === "intro" ? "scale-0 opacity-0 -rotate-12" : "scale-100 opacity-100 rotate-0"
          }`}
        >
          {/* Glowing border */}
          <div
            className={`absolute inset-0 rounded-3xl border-4 border-action-primary-hover transition-all duration-300 ${
              stage === "celebrate" ? "animate-pulse opacity-75" : "opacity-50"
            }`}
          />

          {/* Header: State name and emoji */}
          <div className="text-center mb-6">
            <div className="text-7xl mb-4 transition-transform duration-300">{stateEmoji}</div>
            <h1 className="text-h1 font-black mb-2" style={{ color: "var(--action-primary-fg)" }}>
              {stateName}
            </h1>
            <p className="text-body font-bold" style={{ color: "var(--action-primary-fg)" }}>
              {EMOJI.action.sparkle} Completely Explored! {EMOJI.action.sparkle}
            </p>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-2 gap-4 mb-8 px-2">
            {/* Cards completed */}
            <div
              className="backdrop-blur rounded-2xl p-4 text-center border-2"
              style={{
                backgroundColor: "var(--action-primary-fg)",
                opacity: 0.3,
                borderColor: "color-mix(in srgb, var(--action-primary-fg) 50%, transparent)",
              }}
            >
              <p className="text-h4 font-black mb-1" style={{ color: "var(--action-primary-fg)" }}>
                {cardsCompleted}
              </p>
              <p
                className="text-body-sm"
                style={{ color: "var(--action-primary-fg)", opacity: 0.8 }}
              >
                Cards Done
              </p>
            </div>

            {/* XP gained */}
            <div
              className="backdrop-blur rounded-2xl p-4 text-center border-2"
              style={{
                backgroundColor: "var(--action-primary-fg)",
                opacity: 0.3,
                borderColor: "color-mix(in srgb, var(--action-primary-fg) 50%, transparent)",
              }}
            >
              <p className="text-h4 font-black mb-1" style={{ color: "var(--action-primary-fg)" }}>
                +{totalXpGained}
              </p>
              <p
                className="text-body-sm"
                style={{ color: "var(--action-primary-fg)", opacity: 0.8 }}
              >
                XP Earned
              </p>
            </div>
          </div>

          {/* Badge grid - staggered reveals */}
          <div className="mb-6">
            <p
              className="text-body-sm font-bold mb-3 px-2"
              style={{ color: "var(--action-primary-fg)", opacity: 0.8 }}
            >
              Badges Unlocked:
            </p>
            <div className="grid grid-cols-4 gap-3 px-2">
              {badges.map((badge, index) => {
                const isRevealed = revealedBadges.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`transition-all duration-500 ${
                      isRevealed ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-3 text-center border-3 transition-all ${
                        isRevealed ? "animate-bounce-scale" : ""
                      }`}
                      style={{
                        backgroundColor: "var(--action-primary-fg)",
                        opacity: 0.2,
                        borderColor:
                          "color-mix(in srgb, var(--action-primary-fg) 50%, transparent)",
                      }}
                      title={badge.name}
                    >
                      <div className="text-3xl">{badge.emoji}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Celebration message */}
          <div
            className={`text-center text-h5 font-bold transition-opacity duration-300 ${
              stage === "celebrate" ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: "var(--action-primary-fg)" }}
          >
            {EMOJI.milestone.hundred} Amazing Achievement! {EMOJI.milestone.hundred}
          </div>
        </div>
      </div>
    </>
  );
}
