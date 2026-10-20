import { useState } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { EMOJI } from "@/constants/emoji";

interface AgeBand {
  value: string;
  emoji: string;
  label: string;
  gradient: string;
}

const AGE_BANDS: AgeBand[] = [
  { value: "3-5", emoji: EMOJI.ageBand.toddler, label: "Sprout", gradient: "bg-accent-2" },
  { value: "6-7", emoji: EMOJI.ageBand.young, label: "Seedling", gradient: "bg-accent-1" },
  { value: "8-9", emoji: EMOJI.ageBand.mid, label: "Sapling", gradient: "bg-success" },
  { value: "10-12", emoji: EMOJI.ageBand.preteen, label: "Mighty Tree", gradient: "bg-action-primary" },
];

export interface AgeScreenProps {
  selectedAge: string | null;
  onSelectAge: (age: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AgeScreen({
  selectedAge,
  onSelectAge,
  onBack,
  onNext,
}: AgeScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [animatingAge, setAnimatingAge] = useState<string | null>(null);

  const handleAgeSelect = (age: string) => {
    fxTap();
    fxConfetti();
    setConfettiBurst((n) => n + 1);

    // Trigger scale animation
    setAnimatingAge(age);
    setTimeout(() => setAnimatingAge(null), 300);

    onSelectAge(age);
  };

  const handleSkip = () => {
    fxTap();
    // Default to 6-7 on skip
    onSelectAge("6-7");
    // Trigger next screen after brief delay
    setTimeout(() => onNext(), 200);
  };

  const handleBack = () => {
    fxTap();
    onBack();
  };

  const handleNext = () => {
    fxTap();
    onNext();
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col select-none touch-none relative overflow-hidden">
      <ConfettiBurst trigger={confettiBurst} size="big" />

      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-accent-1 text-text-on-primary">
        <h1 className="text-2xl font-black">How Old Are You?</h1>
        <p className="text-sm opacity-90 mt-1">Step 2/3 — Choose your age band</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
        {AGE_BANDS.map((band) => {
          const isSelected = selectedAge === band.value;
          return (
            <button
              key={band.value}
              type="button"
              onClick={() => handleAgeSelect(band.value)}
              className={`relative rounded-2xl p-4 transition-all duration-300 flex items-center gap-4 text-left
                ${
                  isSelected
                    ? `${band.gradient} text-text-on-primary shadow-elevated-2 scale-105`
                    : "bg-surface-card text-text-primary border-2 border-surface-sunken hover:border-surface-raised"
                }
                ${animatingAge === band.value ? "scale-110" : ""}
              `}
              style={
                animatingAge === band.value
                  ? ({ animation: "scale-pop 0.3s ease-out" } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="text-5xl flex-shrink-0">{band.emoji}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold opacity-80">Ages {band.value}</div>
                <div className="text-lg font-bold">{band.label}</div>
              </div>
              {isSelected && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-text-on-primary flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-action-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {/* Skip Button */}
        <div className="mt-4 pt-4 border-t border-border-color">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 px-4 rounded-xl font-bold text-text-secondary bg-surface-raised hover:bg-surface-sunken transition-colors text-center text-sm"
          >
            Skip — I'll choose later
          </button>
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="px-5 py-4 bg-surface-card border-t border-border-color flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-text-primary bg-surface-raised hover:bg-surface-sunken transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
            selectedAge
              ? "bg-action-primary text-text-on-primary hover:shadow-elevated-1"
              : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
          }`}
          disabled={!selectedAge}
        >
          Next
        </button>
      </div>

      <style>{`
        @keyframes scale-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
