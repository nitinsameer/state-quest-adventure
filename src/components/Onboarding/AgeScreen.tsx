import { useState } from "react";
import { fxTap, fxConfetti, fxCorrect } from "@/lib/fx";
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
  {
    value: "10-12",
    emoji: EMOJI.ageBand.preteen,
    label: "Mighty Tree",
    gradient: "bg-action-primary",
  },
];

export interface AgeScreenProps {
  selectedAge: string | null;
  onSelectAge: (age: string) => void;
  parentConsented: boolean;
  onConsent: (consented: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AgeScreen({
  selectedAge,
  onSelectAge,
  parentConsented,
  onConsent,
  onBack,
  onNext,
}: AgeScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [animatingAge, setAnimatingAge] = useState<string | null>(null);
  const [checkAnimation, setCheckAnimation] = useState(false);

  const handleAgeSelect = (age: string) => {
    fxTap();
    fxConfetti();
    setConfettiBurst((n) => n + 1);

    // Trigger scale animation
    setAnimatingAge(age);
    setTimeout(() => setAnimatingAge(null), 300);

    onSelectAge(age);
  };

  const handleToggleConsent = () => {
    fxTap();

    if (!parentConsented) {
      // Transitioning to checked
      fxCorrect();
      setCheckAnimation(true);
      setTimeout(() => setCheckAnimation(false), 300);
      setConfettiBurst((n) => n + 1);
    }

    onConsent(!parentConsented);
  };

  const handleBack = () => {
    fxTap();
    onBack();
  };

  const handleNext = () => {
    if (!selectedAge || !parentConsented) return;
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
                ${animatingAge === band.value ? "animate-scale-pop" : ""}
              `}
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

        {/* Parent Consent Section */}
        <div className="mt-6 pt-4 border-t border-border-color">
          <div className="bg-surface-card rounded-2xl p-4 shadow-elevated-1">
            <p className="text-xs font-semibold text-text-secondary mb-3">Parent Approval</p>

            {/* Privacy & Safety Info */}
            <div className="mb-3 p-3 bg-accent-1-soft rounded-xl border-l-4 border-accent-1">
              <p className="text-xs text-text-secondary leading-relaxed">
                We follow COPPA and keep kids safe. We don't sell data, and parents can request
                deletion anytime.
              </p>
            </div>

            {/* Consent Checkbox */}
            <button
              type="button"
              onClick={handleToggleConsent}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                parentConsented ? "bg-action-success" : "bg-surface-raised"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`relative w-5 h-5 rounded-lg border-2 flex-shrink-0 transition-all duration-200
                  ${
                    parentConsented
                      ? "border-text-on-primary bg-text-on-primary"
                      : "border-border-color bg-surface-card"
                  }
                  ${checkAnimation ? "animate-checkbox-bounce" : ""}
                `}
              >
                {parentConsented && (
                  <svg
                    className="absolute inset-0 w-full h-full p-0.5 text-success animate-checkbox-draw"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <label className="flex-1 text-left cursor-pointer">
                <p
                  className={`text-xs font-bold transition-colors ${
                    parentConsented ? "text-text-on-primary" : "text-text-primary"
                  }`}
                >
                  I am a parent/guardian. I agree to Terms & Privacy.
                </p>
              </label>
            </button>
          </div>
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
          disabled={!selectedAge || !parentConsented}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
            selectedAge && parentConsented
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
