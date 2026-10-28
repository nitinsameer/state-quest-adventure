import { useState } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { EMOJI } from "@/constants/emoji";
import { getAvatarName } from "@/lib/avatar-config";
import { PremiumHeader } from "./PremiumHeader";
import {
  SproutIllustration,
  SeedlingIllustration,
  SaplingIllustration,
  MightyTreeIllustration,
} from "./AgeIllustrations";
import ageBg from "@/assets/age_selection_bg.png";

interface AgeBand {
  value: string;
  label: string;
  IllustrationComponent: React.ComponentType<{ size?: number; className?: string }>;
}

const AGE_BANDS: AgeBand[] = [
  { value: "3-5", label: "Sprout", IllustrationComponent: SproutIllustration },
  { value: "6-7", label: "Seedling", IllustrationComponent: SeedlingIllustration },
  { value: "8-9", label: "Sapling", IllustrationComponent: SaplingIllustration },
  { value: "10-12", label: "Mighty Tree", IllustrationComponent: MightyTreeIllustration },
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
  const [parentConsented, setParentConsented] = useState(false);

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
    <div
      className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
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
          secondPartColor="var(--accent-5)"
        />
      </div>

      {/* Scrollable Content - includes cards, consent panel, and buttons in flow */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="px-5 py-3 pb-safe flex flex-col gap-3">
          {/* Age Band Cards */}
          {AGE_BANDS.map((band) => {
            const isSelected = selectedAge === band.value;
            const Illustration = band.IllustrationComponent;

            return (
              <button
                key={band.value}
                type="button"
                onClick={() => handleAgeSelect(band.value)}
                className="relative rounded-2xl p-4 transition-all duration-300 flex items-center gap-4 text-left active:scale-95"
                style={{
                  backgroundColor: isSelected ? "var(--accent-1)" : "var(--surface-card)",
                  color: isSelected ? "var(--text-on-primary)" : "var(--text-primary)",
                  boxShadow: isSelected ? "var(--shadow-elevated-2)" : "var(--shadow-elevated-1)",
                  border: isSelected ? "none" : "2px solid var(--surface-raised)",
                  transform: animatingAge === band.value ? "scale(1.05)" : "scale(1)",
                }}
              >
                {/* Age Illustration */}
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <Illustration size={56} />
                </div>

                {/* Age Band Label and Range */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold opacity-85"
                    style={{ color: isSelected ? "var(--text-on-primary)" : "var(--text-secondary)" }}
                  >
                    Ages {band.value}
                  </div>
                  <div className="text-lg font-bold">{band.label}</div>
                </div>

                {/* Checkmark - theme-aware */}
                {isSelected && (
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--text-on-primary)" }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="var(--accent-1)"
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

          {/* Parent Consent Panel */}
          <div
            className="rounded-2xl p-4 mt-2 flex items-start gap-3"
            style={{
              backgroundColor: "var(--surface-card)",
              border: "1px solid var(--surface-raised)",
            }}
          >
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-1">
              <button
                type="button"
                onClick={() => setParentConsented(!parentConsented)}
                className="w-5 h-5 rounded border-2 transition-all flex items-center justify-center"
                style={{
                  backgroundColor: parentConsented ? "var(--accent-1)" : "transparent",
                  borderColor: parentConsented ? "var(--accent-1)" : "var(--surface-raised)",
                }}
              >
                {parentConsented && (
                  <svg className="w-3 h-3" fill="var(--text-on-primary)" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Label with Links */}
            <label className="flex-1 cursor-pointer text-sm font-medium flex flex-wrap gap-1 items-start">
              <span style={{ color: "var(--text-primary)" }}>I am a parent/guardian. I agree to</span>
              <a
                href="https://yourapp.example.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: "var(--accent-2, #0066cc)" }}
                onClick={(e) => e.stopPropagation()}
              >
                Terms
              </a>
              <span style={{ color: "var(--text-primary)" }}>&</span>
              <a
                href="https://yourapp.example.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: "var(--accent-2, #0066cc)" }}
                onClick={(e) => e.stopPropagation()}
              >
                Privacy
              </a>
              <span style={{ color: "var(--text-primary)" }}>.</span>
            </label>
          </div>

          {/* Buttons - In content flow */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 px-4 rounded-full font-bold transition-all active:scale-95"
              style={{
                backgroundColor: "var(--surface-raised)",
                color: "var(--text-primary)",
                border: "2px solid var(--surface-raised)",
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAge}
              className="flex-1 py-3 px-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                backgroundColor: selectedAge ? "var(--action-primary-bg)" : "var(--surface-sunken)",
                color: selectedAge ? "var(--text-on-primary)" : "var(--text-secondary)",
                cursor: selectedAge ? "pointer" : "not-allowed",
                opacity: selectedAge ? 1 : 0.5,
                boxShadow: selectedAge ? "var(--shadow-elevated-1)" : "none",
              }}
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
