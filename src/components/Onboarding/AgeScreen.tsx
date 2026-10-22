import { useState } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { EMOJI } from "@/constants/emoji";
import { getAvatarName } from "@/lib/avatar-config";
import { PremiumHeader } from "./PremiumHeader";
import ageBg from "@/assets/age_selection_bg.png";

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
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden bg-bg-page">
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-top z-0"
        style={{ backgroundImage: `url(${ageBg})`, backgroundPosition: "center top" }}
      />

      {/* Subtle overlay only in header area for text readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 via-black/10 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="big" />

      {/* Header - Fixed at top */}
      <div className="relative z-10 flex-shrink-0">
        <PremiumHeader
          firstPart="How Old"
          secondPart="Are You?"
          subtitle="Choose your age band to get a better learning experience!"
          step={2}
          secondPartColor="#8B5CF6"
        />
      </div>

      {/* Scrollable Content - includes buttons in flow */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="px-5 py-3 pb-safe flex flex-col gap-2">
          {/* Age Bands */}
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

          {/* Parent Approval Section */}
          <div className="flex items-start gap-3 py-3 px-4 bg-surface-card rounded-xl border border-surface-sunken">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center mt-0.5">
              <svg
                className="w-4 h-4 text-white"
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
            <p className="text-sm font-semibold text-text-primary leading-snug">
              This app respects kids' privacy in line with COPPA.
            </p>
          </div>

          {/* Buttons - In content flow */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 px-4 rounded-full font-bold text-text-primary bg-white border-2 border-action-primary transition-all active:scale-95"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAge}
              className={`flex-1 py-3 px-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                selectedAge
                  ? "bg-action-primary text-white hover:shadow-elevated-2"
                  : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
              }`}
            >
              Start My Journey
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
