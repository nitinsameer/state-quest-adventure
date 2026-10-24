import { useProgress, getVisitedCardCount } from "@/lib/progress";

/**
 * CardProgressBar component - displays progress of cards visited in a category
 * Shows a thin progress bar with text label indicating X/Total cards visited
 */
export function CardProgressBar({
  stateName,
  cardCategory,
  totalCards = 6,
}: {
  stateName: string;
  cardCategory: string;
  totalCards?: number;
}) {
  const progress = useProgress();
  const visitedCount = getVisitedCardCount(progress, stateName, cardCategory);
  const percentage = (visitedCount / totalCards) * 100;

  return (
    <div className="mt-(--space-0-5) space-y-(--space-0-25)">
      <div className="h-1.5 rounded-full ui-progress-track overflow-hidden">
        <div
          className="h-full ui-progress-fill transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-label text-center" style={{ color: "var(--text-muted)" }}>
        {visitedCount}/{totalCards} cards
      </div>
    </div>
  );
}
