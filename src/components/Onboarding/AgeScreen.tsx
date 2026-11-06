import { useState, useEffect, useRef } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { getAvatarName } from "@/lib/avatar-config";
import { debugTracker } from "@/lib/debug-tracker";
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
  illustration: React.ComponentType<{ className?: string }>;
  label: string;
  gradient: string;
}

const AGE_BANDS: AgeBand[] = [
  { value: "3-5", illustration: SproutIllustration, label: "Sprout", gradient: "bg-accent-2" },
  { value: "6-7", illustration: SeedlingIllustration, label: "Seedling", gradient: "bg-accent-1" },
  { value: "8-9", illustration: SaplingIllustration, label: "Sapling", gradient: "bg-success" },
  {
    value: "10-12",
    illustration: MightyTreeIllustration,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Debug: Log dimensions on mount and when refs update
  useEffect(() => {
    const logDimensions = () => {
      debugTracker.trackDimensions(
        'AgeScreen',
        containerRef.current,
        headerRef.current,
        contentRef.current,
        footerRef.current
      );
    };

    // Log on mount
    logDimensions();

    // Log after a small delay to ensure layout is complete
    const timer = setTimeout(logDimensions, 500);

    // Log on resize
    window.addEventListener("resize", logDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", logDimensions);
    };
  }, []);

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
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden justify-between" ref={containerRef}>
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-top z-0"
        style={{ backgroundImage: `url(${ageBg})`, backgroundPosition: "center top" }}
      />

      {/* Subtle overlay only in header area for text readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 via-black/10 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="big" />

      {/* Header - Fixed at top */}
      <div className="relative z-10 flex-shrink-0" ref={headerRef}>
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

      {/* Scrollable Content - Age options, takes natural space and scrolls if needed */}
      <div className="relative z-10 overflow-y-auto" ref={contentRef}>
        <div className="px-3 py-2 flex flex-col gap-0.5">
          {/* Age Bands */}
          {AGE_BANDS.map((band) => {
            const isSelected = selectedAge === band.value;
            const IllustrationComponent = band.illustration;
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
                {/* Illustration - Left side */}
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                  <IllustrationComponent className="w-12 h-12" />
                </div>
                
                {/* Text content - Right side */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold opacity-80">Ages {band.value}</div>
                  <div className="text-base font-bold">{band.label}</div>
                </div>
                
                {/* Selected checkmark - Right edge */}
                {isSelected && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white">
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
        </div>
      </div>

      {/* Fixed Footer - Back and Continue buttons */}
      <div className="relative z-20 flex-shrink-0 px-5 py-2 bg-gradient-to-t from-bg-page via-bg-page to-transparent border-t border-border-color flex flex-col gap-2" ref={footerRef}>
        <div className="flex gap-3 pb-safe">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-2 px-4 rounded-full font-black text-base text-ink bg-white border-2 border-action-primary transition-all hover:shadow-md active:scale-95"
            aria-label="Go back"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAge}
            className={`flex-1 py-2 px-4 rounded-full font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
              selectedAge
                ? "bg-gradient-to-r from-[#7650F5] to-[#6366F1] text-white hover:shadow-xl"
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
