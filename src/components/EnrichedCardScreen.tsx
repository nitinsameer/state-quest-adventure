/**
 * Enriched Card Screen
 * Displays all 6 enhanced cards for a state with TTS narration
 * Replaces the basic postcard with rich, interactive content
 */

import { useState } from "react";
import { ExpandableCard } from "./ExpandableCard";
import { getStateContent, type AgeTaggedContent } from "@/lib/state-content";
import { fxTap, fxWhoosh } from "@/lib/fx";
import { useGoBack } from "./screens";

// Helper to extract string from string | AgeTaggedContent union
const extractText = (value: string | AgeTaggedContent): string => {
  return typeof value === "string" ? value : value.text;
};

const extractTextArray = (value: string[] | AgeTaggedContent[]): string[] => {
  if (!value) return [];
  return value.map((v) => (typeof v === "string" ? v : v.text));
};

const CARD_COLORS = [
  { bg: "bg-action-primary/10", border: "border-action-primary" }, // Capital
  { bg: "bg-info-soft", border: "border-info" }, // Language
  { bg: "bg-accent-2-soft", border: "border-accent-2" }, // Food
  { bg: "bg-success-soft", border: "border-success" }, // Places
  { bg: "bg-accent-1-soft", border: "border-accent-1" }, // Animal
  { bg: "bg-accent-3-soft", border: "border-accent-3" }, // Fun Fact
];

export function EnrichedCardScreen({ stateName = "Rajasthan" }: { stateName?: string } = {}) {
  const goBack = useGoBack();
  const content = getStateContent(stateName);
  const [activeTab, setActiveTab] = useState(0);

  if (!content) {
    return (
      <div className="h-full w-full bg-page flex flex-col items-center justify-center gap-(--gap-base) p-(--padding-lg)">
        <div className="text-4xl">🏜️</div>
        <div className="text-center">
          <div className="text-display font-extrabold text-lg">Coming Soon!</div>
          <div className="text-sm text-muted-foreground mt-2">
            {stateName} enriched cards will be available soon!
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    { id: "capital", ...content.capital },
    { id: "language", ...content.language },
    { id: "food", ...content.food },
    { id: "places", ...content.places },
    { id: "animal", ...content.animal },
    { id: "funFact", ...content.funFact },
  ];

  const currentCard = cards[activeTab]!;
  const colors = CARD_COLORS[activeTab];

  // Guard: ensure currentCard has required properties
  if (!currentCard || !("title" in currentCard && "emoji" in currentCard)) {
    return (
      <div className="h-full w-full bg-page flex flex-col items-center justify-center gap-(--gap-base) p-(--padding-lg)">
        <div className="text-4xl">❌</div>
        <div className="text-center">
          <div className="text-display font-extrabold text-lg">Card unavailable</div>
          <div className="text-sm text-muted-foreground mt-2">
            This card could not be loaded. Please try again.
          </div>
        </div>
      </div>
    );
  }

  const handleTabChange = (index: number) => {
    if (index !== activeTab) {
      fxWhoosh();
      setActiveTab(index);
    }
  };

  return (
    <div className="h-full w-full bg-page flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-5 pt-(--padding-base) pb-(--padding-base) rounded-b-[36px] flex-shrink-0" style={{backgroundColor: "var(--accent-5)", color: "var(--accent-5-ink)"}}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              fxTap();
              goBack();
            }}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-surface-card/20 text-text-on-primary flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-display font-extrabold text-text-on-header text-center flex-1">
            {stateName} 🎓
          </div>
          <div className="h-10 w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Card Display Area */}
      <div className="flex-1 overflow-y-auto px-5 py-(--padding-md)">
        <ExpandableCard
          cardId={`${stateName}-${currentCard.id}`}
          title={currentCard.title}
          emoji={currentCard.emoji}
          mainText={currentCard.mainText}
          keyFacts={extractTextArray(currentCard.keyFacts)}
          narration={currentCard.narration}
          coolFacts={currentCard.coolFacts ? extractTextArray(currentCard.coolFacts) : undefined}
          didYouKnow={currentCard.didYouKnow ? extractText(currentCard.didYouKnow) : undefined}
          tryThis={currentCard.tryThis ? extractText(currentCard.tryThis) : undefined}
          backgroundColor={colors.bg}
          borderColor={colors.border}
        />
      </div>

      {/* Card Navigation Tabs */}
      <div className="flex-shrink-0 bg-surface-card/80 backdrop-blur border-t border-border-subtle px-(--padding-sm) py-(--padding-base)">
        <div className="flex gap-(--gap-compact) overflow-x-auto pb-1">
          {cards.map((card, index) => {
            const safeCard = card as typeof card & { emoji: string };
            return (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`flex-shrink-0 h-14 px-(--padding-sm) rounded-2xl transition-all font-extrabold text-display text-sm ${
                  activeTab === index
                    ? `${CARD_COLORS[index].bg} border-2 ${CARD_COLORS[index].border} shadow-md scale-105`
                    : "bg-surface-card/50 border-2 border-transparent hover:bg-surface-card/70"
                }`}
              >
                <span className="text-2xl">{safeCard.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Card Info */}
        <div className="px-(--padding-sm) mt-(--space-3) text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {activeTab + 1} of {cards.length} • {currentCard.title.split(" ")[0]}
        </div>
      </div>
    </div>
  );
}
