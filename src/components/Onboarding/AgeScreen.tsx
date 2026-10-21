import { useState } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { EMOJI } from "@/constants/emoji";
import { getAvatarName } from "@/lib/avatar-config";

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
  {
    value: "10-12",
    emoji: EMOJI.ageBand.preteen,
    label: "Mighty Tree",
    gradient: "bg-action-primary",
  },
];

export interface AgeScreenProps {
  selectedAvatar: string | null;
  selectedAge: string | null;
  onSelectAge: (age: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AgeScreen({
  selectedAvatar,
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

  const handleBack = () => {
    fxTap();
    onBack();
  };

  const handleNext = () => {
    if (!selectedAge) return;
    fxTap();
    onNext();
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col select-none touch-none relative overflow-hidden">
      <ConfettiBurst trigger={confettiBurst} size="big" />

      {/* Header - Clean, no step indicator */}
      <div className="px-5 pt-3 pb-2 bg-accent-1 text-text-on-primary flex-shrink-0">
        <h1 className="text-2xl font-black">What's Your Age?</h1>
      </div>

      {/* Content - Compact layout */}
      <div className="flex-1 overflow-hidden px-5 py-3 flex flex-col gap-2">
        {/* Selected Avatar Preview */}
        {selectedAvatar && (
          <div className="flex items-center gap-2 pb-2 border-b border-border-color">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-sm">
              <img
                src={`/src/assets/avatars/${selectedAvatar}.png`}
                alt={getAvatarName(selectedAvatar)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs opacity-80">Your explorer:</p>
              <p className="text-sm font-bold truncate">{getAvatarName(selectedAvatar)}</p>
            </div>
          </div>
        )}

        {/* Age Bands - Scrollable if needed */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {AGE_BANDS.map((band) => {
            const isSelected = selectedAge === band.value;
            return (
              <button
                key={band.value}
                type="button"
                onClick={() => handleAgeSelect(band.value)}
                className={`relative rounded-xl p-3 transition-all duration-300 flex items-center gap-3 text-left
                  ${
                    isSelected
                      ? `${band.gradient} text-text-on-primary shadow-elevated-2 scale-105`
                      : "bg-surface-card text-text-primary border-2 border-surface-sunken hover:border-surface-raised"
                  }
                  ${animatingAge === band.value ? "animate-scale-pop" : ""}
                `}
              >
                <div className="text-3xl flex-shrink-0">{band.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold opacity-80">Ages {band.value}</div>
                  <div className="text-base font-bold">{band.label}</div>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-text-on-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-action-primary"
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
        </div>
      </div>

      {/* Footer with buttons */}
      <div className="px-5 py-2 bg-surface-card border-t border-border-color flex-shrink-0 gap-3 flex pb-safe">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-2.5 px-4 rounded-xl font-bold text-text-primary bg-surface-raised hover:bg-surface-sunken transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedAge}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-colors text-sm ${
            selectedAge
              ? "bg-action-primary text-text-on-primary hover:shadow-elevated-1"
              : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
