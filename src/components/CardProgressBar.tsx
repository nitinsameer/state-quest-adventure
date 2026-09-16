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
    <div className="mt-3 space-y-1">
      <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs font-bold text-muted-foreground text-center">
        {visitedCount}/{totalCards} cards
      </div>
    </div>
  );
}
