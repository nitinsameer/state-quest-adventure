/**
 * Enriched Card Screen
 * Displays all 6 enhanced cards for a state with TTS narration
 * Replaces the basic postcard with rich, interactive content
 */

import { useState } from "react";
import { ExpandableCard } from "./ExpandableCard";
import { getStateContent } from "@/lib/state-content";
import { fxTap, fxWhoosh } from "@/lib/fx";
import { useGoBack } from "./screens";

const CARD_COLORS = [
  { bg: "bg-orange-soft", border: "border-orange-200" }, // Capital
  { bg: "bg-info-soft", border: "border-info" }, // Language
  { bg: "bg-yellow-50", border: "border-yellow-200" }, // Food
  { bg: "bg-success-soft", border: "border-success" }, // Places
  { bg: "bg-rose-50", border: "border-rose-200" }, // Animal
  { bg: "bg-indigo-50", border: "border-indigo-200" }, // Fun Fact
];

export function EnrichedCardScreen({ stateName = "Rajasthan" }: { stateName?: string } = {}) {
  const goBack = useGoBack();
  const content = getStateContent(stateName);
  const [activeTab, setActiveTab] = useState(0);

  if (!content) {
    return (
      <div className="h-full w-full bg-[#F7F5F0] flex flex-col items-center justify-center gap-[--gap-base] p-[--padding-lg]">
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

  const currentCard = cards[activeTab];
  const colors = CARD_COLORS[activeTab];

  const handleTabChange = (index: number) => {
    if (index !== activeTab) {
      fxWhoosh();
      setActiveTab(index);
    }
  };

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative gradient-explorer px-5 pt-[--padding-base] pb-[--padding-base] rounded-b-[36px] flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              fxTap();
              goBack();
            }}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center"
          >
            ‹
          </button>
          <div className="text-display font-extrabold text-white text-center flex-1">
            {stateName} 🎓
          </div>
          <div className="h-10 w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Card Display Area */}
      <div className="flex-1 overflow-y-auto px-5 py-[--padding-md]">
        <ExpandableCard
          cardId={`${stateName}-${currentCard.id}`}
          title={currentCard.title}
          emoji={currentCard.emoji}
          mainText={currentCard.mainText}
          keyFacts={currentCard.keyFacts}
          narration={currentCard.narration}
          coolFacts={currentCard.coolFacts}
          didYouKnow={currentCard.didYouKnow}
          tryThis={currentCard.tryThis}
          backgroundColor={colors.bg}
          borderColor={colors.border}
        />
      </div>

      {/* Card Navigation Tabs */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur border-t border-black/5 px-[--padding-sm] py-[--padding-base]">
        <div className="flex gap-[--gap-compact] overflow-x-auto pb-1">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`flex-shrink-0 h-14 px-[--padding-sm] rounded-2xl transition-all font-extrabold text-display text-sm ${
                activeTab === index
                  ? `${CARD_COLORS[index].bg} border-2 ${CARD_COLORS[index].border} shadow-md scale-105`
                  : "bg-white/50 border-2 border-transparent hover:bg-white/70"
              }`}
            >
              <span className="text-2xl">{card.emoji}</span>
            </button>
          ))}
        </div>

        {/* Card Info */}
        <div className="px-[--padding-sm] mt-[--space-3] text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {activeTab + 1} of {cards.length} • {currentCard.title.split(" ")[0]}
        </div>
      </div>
    </div>
  );
}

