import { useState } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { getAvatarName } from "@/lib/avatar-config";
import { PremiumHeader } from "./PremiumHeader";
import {
  SproutIllustration,
  SeedlingIllustration,
  SaplingIllustration,
  MightyTreeIllustration,
} from "./AgeIllustrations";
import ageBg from "@/assets/age_selection_bg.png";
import sproutCardBg from "@/assets/age-selection-bg/age_card_sprout.png";
import seedlingCardBg from "@/assets/age-selection-bg/age_card_seedling_selected.png";
import saplingCardBg from "@/assets/age-selection-bg/age_card_sapling.png";
import mightyTreeCardBg from "@/assets/age-selection-bg/age_card_mighty_tree.png";

interface AgeBand {
  value: string;
  label: string;
  subtitle: string;
  cardBg: string;
}

const AGE_BANDS: AgeBand[] = [
  {
    value: "3-5",
    label: "Sprout",
    subtitle: "I am just starting to explore!",
    cardBg: sproutCardBg,
  },
  {
    value: "6-7",
    label: "Seedling",
    subtitle: "I love to learn new things!",
    cardBg: seedlingCardBg,
  },
  {
    value: "8-9",
    label: "Sapling",
    subtitle: "I can explore and do more!",
    cardBg: saplingCardBg,
  },
  {
    value: "10-12",
    label: "Mighty Tree",
    subtitle: "I'm ready for big adventures!",
    cardBg: mightyTreeCardBg,
  },
];

export interface AgeScreenProps {
  selectedAvatar: string | null;
  selectedAge: string | null;
  onSelectAge: (age: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function AgeScreen({
  selectedAvatar,
  selectedAge,
  onSelectAge,
  onBack,
  onNext,
  onSkip,
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

  const handleSkipClick = () => {
    fxTap();
    onSkip();
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
        {/* Skip button row - mirrors Avatar layout */}
        <div className="flex items-center justify-between px-5 pt-safe pb-1">
          <div></div> {/* Spacer for flex-between */}
          <button
            type="button"
            onClick={handleSkipClick}
            className="bg-white rounded-full px-3 py-1 shadow-md hover:shadow-lg active:scale-95 transition-all font-black text-sm text-ink"
            aria-label="Skip to home"
          >
            Skip
          </button>
        </div>
        
        {/* PremiumHeader - no step badge */}
        <PremiumHeader
          firstPart="How Old"
          secondPart="Are You?"
          subtitle="Choose your age band to get a better learning experience!"
          step={2}
          secondPartColor="var(--accent-5)"
          showStepBadge={false}
        />
      </div>

      {/* Scrollable Content - Age options only */}
      <div className="relative z-10 flex-1 overflow-y-auto min-h-0">
        <div className="px-5 py-3 flex flex-col gap-2">
          {/* Age Selection Fieldset */}
          <fieldset className="space-y-2">
            <legend className="sr-only">Select your age band</legend>
          {AGE_BANDS.map((band) => {
            const isSelected = selectedAge === band.value;
            return (
              <button
                key={band.value}
                type="button"
                onClick={() => handleAgeSelect(band.value)}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${band.label}, ages ${band.value}`}
                className={`relative rounded-3xl p-4 transition-all duration-300 flex items-center gap-4 text-left min-h-20 overflow-hidden ${
                  isSelected
                    ? "border-4 border-accent-5 shadow-elevated-2 scale-105"
                    : "border-3 border-surface-card shadow-md hover:shadow-elevated-1"
                }`}
                style={{
                  backgroundImage: `url(${band.cardBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                {/* Text content - positioned relative to overlay */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="text-sm font-semibold text-accent-5 opacity-90">Ages {band.value}</div>
                  <div className="text-lg font-bold text-accent-5">{band.label}</div>
                  <div className="text-xs font-medium text-accent-5 opacity-80 mt-1">{band.subtitle}</div>
                </div>

                {/* Selected checkmark - Right edge */}
                {isSelected && (
                  <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-accent-5 flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
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
            </fieldset>
        </div>
      </div>

      {/* Fixed Footer - Back and Continue buttons */}
      <div className="relative z-20 flex-shrink-0 px-5 py-4 pb-safe bg-gradient-to-t from-bg-page via-bg-page to-transparent">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-4 px-6 rounded-full font-bold text-base text-accent-5 bg-surface-card border-3 border-accent-5 transition-all hover:shadow-md active:scale-95"
            aria-label="Go back"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAge}
            className={`flex-1 py-4 px-6 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
              selectedAge
                ? "bg-accent-5 text-white hover:shadow-elevated-2"
                : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
            }`}
            aria-label="Start my journey"
          >
            <span>Start My Journey</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
