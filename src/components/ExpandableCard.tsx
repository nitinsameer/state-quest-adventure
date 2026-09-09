/**
 * Expandable Card Component
 * Shows main content, expandable key facts, and narration player
 * Kid-friendly with fun interactions
 */

import { useState } from "react";
import { CardNarrationPlayer } from "./CardNarrationPlayer";
import { fxTap } from "@/lib/fx";

export interface ExpandableCardProps {
  cardId: string;
  title: string;
  emoji: string;
  mainText: string;
  keyFacts: string[];
  narration: string;
  coolFacts?: string[];
  didYouKnow?: string;
  tryThis?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export function ExpandableCard({
  cardId,
  title,
  emoji,
  mainText,
  keyFacts,
  narration,
  coolFacts,
  didYouKnow,
  tryThis,
  backgroundColor = "bg-blue-50",
  borderColor = "border-blue-200",
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleFactsCount, setVisibleFactsCount] = useState(3);
  const [expandedDetailIndex, setExpandedDetailIndex] = useState<number | null>(null);

  const handleToggleExpand = () => {
    fxTap();
    setIsExpanded(!isExpanded);
  };

  const handleShowMore = () => {
    fxTap();
    setVisibleFactsCount((prev) => Math.min(prev + 3, keyFacts.length));
  };

  const handleToggleDetail = (index: number) => {
    fxTap();
    setExpandedDetailIndex(expandedDetailIndex === index ? null : index);
  };

  const hasMoreFacts = visibleFactsCount < keyFacts.length;
  const hasExpandedDetails = coolFacts || didYouKnow || tryThis;

  return (
    <div className={`w-full ${backgroundColor} rounded-2xl border-2 ${borderColor} p-4 transition-all duration-300`}>
      {/* Header with Main Text moved here */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-4xl flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-display font-extrabold text-lg leading-snug text-gray-900">{title}</h3>
          {/* Main Text positioned just above key facts to preserve space */}
          <p className="text-xs font-semibold text-gray-700 leading-relaxed mt-1.5">{mainText}</p>
        </div>
      </div>

      {/* Key Facts Section */}
      {keyFacts.length > 0 && (
        <div className="mb-3">
          <button
            onClick={handleToggleExpand}
            className="w-full flex items-center justify-between mb-2 p-2 rounded-lg hover:bg-black/5 active:scale-95 transition"
          >
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {isExpanded ? "📖 Hide Facts" : "✨ Cool Facts"}
            </span>
            <span className="text-lg transition-transform" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▼
            </span>
          </button>

          {isExpanded && (
            <div className="space-y-2 pl-1">
              {keyFacts.slice(0, visibleFactsCount).map((fact, index) => (
                <div
                  key={index}
                  className="text-xs font-semibold text-gray-800 bg-white/60 p-2 rounded-lg border-l-3 border-blue-400 animate-fadeIn"
                >
                  {fact}
                </div>
              ))}

              {hasMoreFacts && (
                <button
                  onClick={handleShowMore}
                  className="w-full mt-2 py-2 px-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-xs font-bold text-blue-700 active:scale-95 transition"
                >
                  + Show {Math.min(3, keyFacts.length - visibleFactsCount)} More Facts ⭐
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded Details Section */}
      {hasExpandedDetails && (
        <div className="mb-3 space-y-2">
          {/* Cool Facts Detail */}
          {coolFacts && coolFacts.length > 0 && (
            <div className="overflow-hidden">
              <button
                onClick={() => handleToggleDetail(0)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 active:scale-95 transition bg-amber-50 border border-amber-200"
              >
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  ⭐ More Amazing Facts
                </span>
                <span className="text-lg transition-transform" style={{ transform: expandedDetailIndex === 0 ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>
              
              {expandedDetailIndex === 0 && (
                <div className="mt-2 space-y-2 pl-1 animate-fadeIn">
                  {coolFacts.map((fact, index) => (
                    <div
                      key={index}
                      className="text-xs font-semibold text-gray-800 bg-amber-50 p-2 rounded-lg border-l-3 border-amber-400"
                    >
                      {fact}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Did You Know Detail */}
          {didYouKnow && (
            <div className="overflow-hidden">
              <button
                onClick={() => handleToggleDetail(1)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 active:scale-95 transition bg-purple-50 border border-purple-200"
              >
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  🤔 Did You Know?
                </span>
                <span className="text-lg transition-transform" style={{ transform: expandedDetailIndex === 1 ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>

              {expandedDetailIndex === 1 && (
                <div className="mt-2 bg-purple-50 p-3 rounded-lg border-2 border-purple-300 animate-fadeIn">
                  <p className="text-xs font-bold text-purple-900 leading-relaxed">
                    {didYouKnow}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Try This Detail */}
          {tryThis && (
            <div className="overflow-hidden">
              <button
                onClick={() => handleToggleDetail(2)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 active:scale-95 transition bg-green-50 border border-green-200"
              >
                <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                  🎮 Try This Activity
                </span>
                <span className="text-lg transition-transform" style={{ transform: expandedDetailIndex === 2 ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>

              {expandedDetailIndex === 2 && (
                <div className="mt-2 bg-green-50 p-3 rounded-lg border-2 border-green-300 animate-fadeIn">
                  <p className="text-xs font-bold text-green-900 leading-relaxed">
                    {tryThis}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Narration Player */}
      <CardNarrationPlayer
        narrationId={cardId}
        text={narration}
        title={title}
        emoji={emoji}
      />
    </div>
  );
}

// Add fadeIn animation
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
