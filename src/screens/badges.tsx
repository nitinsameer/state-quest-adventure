// Badges screens: BadgesScreen, BadgeDetailModal

import { useGoBack, BottomNav, HeaderBar } from "./shared";
import { useProgress, badgesFor, STATE_BADGES } from "@/lib/progress";
import { getState } from "@/lib/states";
import { useState } from "react";
import { fxTap } from "@/lib/fx";

export function BadgesScreen() {
  const p = useProgress();
  const goBack = useGoBack();
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const allBadges = badgesFor(p);
  const earnedBadges = allBadges.filter(b => p.badges.includes(b));

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Badges" onBack={true} />
      
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-display text-2xl font-extrabold">Your Badges</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Earn badges by mastering states
          </p>
          <div className="mt-4 text-display font-extrabold text-saffron">
            {earnedBadges.length} / {allBadges.length} earned
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const earned = p.badges.includes(badge);
            return (
              <button
                key={badge}
                onClick={() => {
                  fxTap();
                  setSelectedBadge(badge);
                }}
                className={`rounded-2xl p-4 flex flex-col items-center justify-center transition transform active:scale-95 ${
                  earned
                    ? "bg-gradient-to-br from-yellow-200 to-yellow-100 border-2 border-yellow-400 shadow-md hover:shadow-lg"
                    : "bg-gray-100 border-2 border-gray-300 opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-xs font-bold text-center line-clamp-2">{badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badgeName={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      <BottomNav active="badges" />
    </div>
  );
}

export function BadgeDetailModal({
  badgeName,
  onClose,
}: {
  badgeName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end animate-fade-in z-50"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="text-7xl mb-4">⭐</div>
          <h2 className="text-display text-2xl font-extrabold">{badgeName}</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            You've earned this badge by exploring and mastering states!
          </p>
          <button
            onClick={() => {
              fxTap();
              onClose();
            }}
            className="mt-8 h-12 px-6 rounded-2xl gradient-saffron text-white text-display font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
