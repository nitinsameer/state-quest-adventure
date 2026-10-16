/**
 * Expandable Card Component
 * Shows main content, expandable key facts, and narration player
 * Kid-friendly with fun interactions
 */

import { useState } from "react";
import { CardNarrationPlayer } from "./CardNarrationPlayer";
import { fxTap } from "@/lib/fx";
import { EMOJI } from "@/constants/emoji";

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
  backgroundColor = "bg-info-soft",
  borderColor = "border-info",
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
    <div
      className={`w-full ${backgroundColor} rounded-2xl border-2 ${borderColor} p-(--padding-md) transition-all duration-300 shadow-soft`}
    >
      {/* Header with Main Text moved here */}
      <div className="flex items-start gap-(--gap-base) mb-(--space-3)">
        <div className="text-3xl flex-shrink-0">{emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-display font-bold text-xl leading-snug text-muted-dark">{title}</h3>
          {/* Main Text positioned just above key facts to preserve space */}
          <p className="text-sm font-semibold text-muted-foreground leading-relaxed mt-1.5">
            {mainText}
          </p>
        </div>
      </div>

      {/* Key Facts Section */}
      {keyFacts.length > 0 && (
        <div className="mb-(--space-3)">
          <button
            onClick={handleToggleExpand}
            className="w-full flex items-center justify-between mb-2 p-(--padding-sm) rounded-lg hover:bg-surface-sunken active:scale-95 transition"
          >
            <span className="text-xs font-bold text-muted-foreground">
              {isExpanded ? <>{EMOJI.icons.facts} Hide Facts</> : <>{EMOJI.action.sparkle} Cool Facts</>}
            </span>
            <span
              className="text-lg transition-transform"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </button>

          {isExpanded && (
            <div className="space-y-2 pl-1">
              {keyFacts.slice(0, visibleFactsCount).map((fact, index) => (
                <div
                  key={index}
                  className="text-xs font-semibold text-muted-dark bg-surface-card/60 p-(--padding-sm) rounded-lg border-l-3 border-info animate-fadeIn"
                >
                  {fact}
                </div>
              ))}

              {hasMoreFacts && (
                <button
                  onClick={handleShowMore}
                  className="w-full mt-2 py-(--padding-sm) px-(--padding-base) bg-accent-1-soft hover:bg-accent-1-soft/70 rounded-lg text-xs font-bold text-accent-1 active:scale-95 transition"
                >
                  + Show {Math.min(3, keyFacts.length - visibleFactsCount)} More Facts{" "}
                  {EMOJI.action.star}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded Details Section */}
      {hasExpandedDetails && (
        <div className="mb-(--space-3) space-y-2">
          {/* Cool Facts Detail */}
          {coolFacts && coolFacts.length > 0 && (
            <div className="overflow-hidden">
              <button
                onClick={() => handleToggleDetail(0)}
                className="w-full flex items-center justify-between p-(--padding-sm) rounded-lg hover:bg-surface-sunken active:scale-95 transition bg-warning-soft border border-warning"
              >
                <span className="text-xs font-bold text-warning">
                  {EMOJI.action.star} More Amazing Facts
                </span>
                <span
                  className="text-lg transition-transform"
                  style={{
                    transform: expandedDetailIndex === 0 ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {expandedDetailIndex === 0 && (
                <div className="mt-2 space-y-2 pl-1 animate-fadeIn">
                  {coolFacts.map((fact, index) => (
                    <div
                      key={index}
                      className="text-xs font-semibold text-text-secondary bg-warning-soft p-(--padding-sm) rounded-lg border-l-3 border-warning"
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
                className="w-full flex items-center justify-between p-(--padding-sm) rounded-lg hover:bg-surface-sunken active:scale-95 transition bg-accent-5-soft border border-accent-5"
              >
                <span className="text-xs font-bold text-accent-5">🤔 Did You Know?</span>
                <span
                  className="text-lg transition-transform"
                  style={{
                    transform: expandedDetailIndex === 1 ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {expandedDetailIndex === 1 && (
                <div className="mt-2 bg-accent-5-soft p-(--padding-base) rounded-lg border-2 border-accent-5 animate-fadeIn">
                  <p className="text-xs font-bold text-accent-5 leading-relaxed">{didYouKnow}</p>
                </div>
              )}
            </div>
          )}

          {/* Try This Detail */}
          {tryThis && (
            <div className="overflow-hidden">
              <button
                onClick={() => handleToggleDetail(2)}
                className="w-full flex items-center justify-between p-(--padding-sm) rounded-lg hover:bg-surface-sunken active:scale-95 transition bg-success-soft border border-success"
              >
                <span className="text-xs font-bold text-success">🎮 Try This Activity</span>
                <span
                  className="text-lg transition-transform"
                  style={{
                    transform: expandedDetailIndex === 2 ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {expandedDetailIndex === 2 && (
                <div className="mt-2 bg-success-soft p-(--padding-base) rounded-lg border-2 border-success animate-fadeIn">
                  <p className="text-xs font-bold text-success leading-relaxed">{tryThis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Narration Player */}
      <CardNarrationPlayer narrationId={cardId} text={narration} title={title} emoji={emoji} />
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
