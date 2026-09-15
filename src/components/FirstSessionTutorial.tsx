/**
 * First Session Tutorial
 * 3-step interactive walkthrough for new users
 * - Step 1: How to read learning cards
 * - Step 2: How to take quizzes and earn XP
 * - Step 3: How to unlock new states
 * 
 * Shows once per profile, can be skipped
 */

import { useState, useEffect } from "react";
import { fxTap } from "@/lib/fx";
import mascot from "@/assets/mascot.png";

export interface FirstSessionTutorialProps {
  onComplete?: () => void;
  isVisible?: boolean;
}

export function FirstSessionTutorial({ onComplete, isVisible = true }: FirstSessionTutorialProps) {
  const [step, setStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has already seen tutorial
  useEffect(() => {
    const seen = localStorage.getItem("india-explorer:first-session-tutorial-shown:v1") === "1";
    setHasSeenTutorial(seen);
  }, []);

  if (hasSeenTutorial || !isVisible) {
    return null;
  }

  const handleSkip = () => {
    fxTap();
    localStorage.setItem("india-explorer:first-session-tutorial-shown:v1", "1");
    setHasSeenTutorial(true);
    onComplete?.();
  };

  const handleNext = () => {
    fxTap();
    if (step === 2) {
      localStorage.setItem("india-explorer:first-session-tutorial-shown:v1", "1");
      setHasSeenTutorial(true);
      onComplete?.();
    } else {
      setStep(step + 1);
    }
  };

  const steps = [
    {
      title: "📚 Learn About States",
      emoji: "🎓",
      description: "Tap 'Play' to read fun facts about each state. Each fact is a card!",
      tips: [
        "🎵 Tap the speaker icon to hear the story",
        "👉 Swipe or tap to move to the next card",
        "⭐ Each card gives you 10 XP",
      ],
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      title: "🎯 Take Quizzes & Earn XP",
      emoji: "❓",
      description: "After reading all the cards, take the quiz! Answer correctly to earn big XP.",
      tips: [
        "✅ Right answers give you 50 XP",
        "💪 You've got this! It's okay to learn",
        "🎉 Finish the quiz to complete the state",
      ],
      gradient: "from-purple-400 to-pink-500",
    },
    {
      title: "🔓 Unlock New States",
      emoji: "🗺️",
      description: "Complete states to unlock the next adventure. Each state = 1 stamp for your passport!",
      tips: [
        "🏆 Collect all 36 state stamps",
        "🔥 Build a daily streak",
        "🏅 Earn special badges",
      ],
      gradient: "from-green-400 to-emerald-500",
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      {/* Tutorial Card */}
      <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${current.gradient} rounded-2xl p-6 text-white text-center relative`}>
          <div className="text-6xl mb-2">{current.emoji}</div>
          <h2 className="text-display text-xl font-extrabold">{current.title}</h2>
        </div>

        {/* Mascot Helper */}
        <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4">
          <img src={mascot} alt="Helper mascot" className="w-12 h-12 object-contain flex-shrink-0" />
          <p className="text-sm font-semibold text-blue-900">{current.description}</p>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          {current.tips.map((tip, idx) => (
            <div key={idx} className="flex gap-2 text-sm text-ink">
              <span className="flex-shrink-0">{tip.split(" ")[0]}</span>
              <span className="font-semibold">{tip.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 justify-center">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === step ? "bg-ink w-6" : "bg-muted w-2"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 rounded-xl text-muted-foreground font-bold text-sm hover:bg-muted transition"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${current.gradient} text-white font-bold text-sm shadow-lg transition active:scale-95`}
          >
            {step === 2 ? "Got It! 🚀" : "Next →"}
          </button>
        </div>

        {/* Helpful text */}
        <p className="text-xs text-muted-foreground text-center">
          💡 You can always come back to learn more by tapping the state cards!
        </p>
      </div>
    </div>
  );
}
