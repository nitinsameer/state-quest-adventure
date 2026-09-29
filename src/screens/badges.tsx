// Badges screens: BadgesScreen, BadgeDetailModal

import { BottomNav, getAvatarImage, getAvatarName } from "./shared";
import { useProgress, badgeCount } from "@/lib/progress";
import { useState } from "react";
import { fxTap } from "@/lib/fx";

// Achievement tier configuration
const ACHIEVEMENT_TIERS = [
  { 
    tier: "seedling",
    emoji: "🌱",
    label: "Seedling",
    color: "from-orange-400 to-yellow-500",
    bgColor: "from-orange-100 to-yellow-50",
    textColor: "text-orange-700",
    badgeEmojis: ["🎯", "📚", "🧠", "⚡", "🔥"]
  },
  { 
    tier: "growing",
    emoji: "🌿",
    label: "Growing",
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-100 to-emerald-50",
    textColor: "text-green-700",
    badgeEmojis: ["💪", "🎓", "🌟", "⭐", "🎖️"]
  },
  { 
    tier: "mighty",
    emoji: "🌳",
    label: "Mighty",
    color: "from-blue-400 to-purple-500",
    bgColor: "from-blue-100 to-purple-50",
    textColor: "text-blue-700",
    badgeEmojis: ["🏆", "👑", "💎", "🔱", "⚔️"]
  },
  { 
    tier: "elite",
    emoji: "🌲",
    label: "Elite",
    color: "from-amber-400 to-orange-600",
    bgColor: "from-amber-100 to-orange-50",
    textColor: "text-amber-700",
    badgeEmojis: ["🥇", "👸", "🌠", "✨", "🎆"]
  }
];

const ACHIEVEMENT_BADGES = [
  { name: "Explorer's Awakening", icon: "🎯", description: "Complete your first state" },
  { name: "Reader", icon: "📚", description: "Read 50 cards" },
  { name: "Quiz Starter", icon: "🧠", description: "Complete 10 quizzes" },
  { name: "Speed Demon", icon: "⚡", description: "Complete a quiz in under 30 seconds" },
  { name: "Fired Up", icon: "🔥", description: "Unlock with 5 day streak", unlocked: true },
  { name: "Strong Explorer", icon: "💪", description: "Complete 10 states" },
  { name: "Master Learner", icon: "🎓", description: "Score 100% on 5 quizzes" },
  { name: "Star Finder", icon: "🌟", description: "Discover all Easter eggs" },
  { name: "Trophy Collector", icon: "🏆", description: "Earn all achievement tiers" },
  { name: "Legend", icon: "👑", description: "Complete all 28 states" }
];

export function BadgesScreen() {
  const p = useProgress();
  const [selectedBadge, setSelectedBadge] = useState<{ name: string; icon: string } | null>(null);
  const earnedCount = badgeCount(p);
  const totalBadges = ACHIEVEMENT_BADGES.length;

  return (
    <div className="h-full w-full bg-[#F7F5F0] flex flex-col overflow-hidden">
      {/* Premium Orange Header */}
      <div className="px-5 pt-4 pb-6 gradient-saffron rounded-b-[32px] relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-soft flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={getAvatarImage(p.avatar)} alt={getAvatarName(p.avatar)} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-white">
              <div className="text-display text-lg font-extrabold leading-tight">
                {p.name}
              </div>
              <div className="text-xs font-semibold opacity-90">Achievement Collection</div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-white">
              <div className="text-display text-sm font-extrabold">
                {earnedCount}/{totalBadges}
              </div>
              <div className="text-xs font-semibold opacity-90">Unlocked</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(earnedCount / totalBadges) * 100}%` }}
            />
          </div>
          <div className="text-white text-sm font-bold">
            {Math.round((earnedCount / totalBadges) * 100)}%
          </div>
        </div>

        {/* Progress Indicator Dots */}
        <div className="mt-2 flex justify-end gap-1">
          {ACHIEVEMENT_TIERS.map((tier, idx) => (
            <div
              key={tier.tier}
              className={`h-2 w-2 rounded-full ${idx < Math.floor(earnedCount / 3) ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Achievement Tiers Section */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="space-y-4">
          {/* Tier Progress Cards */}
          <div className="space-y-2.5">
            {ACHIEVEMENT_TIERS.map((tierConfig, tierIdx) => {
              const tierBadgeCount = 3; // Each tier has 3 badges (10 total / 4 tiers ≈ 2-3 per tier)
              const tierBadges = ACHIEVEMENT_BADGES.slice(tierIdx * tierBadgeCount, (tierIdx + 1) * tierBadgeCount);
              const earnedInTier = tierBadges.filter(b => b.unlocked || p.badges.includes(b.name)).length;
              const tierProgress = Math.round((earnedInTier / tierBadges.length) * 100);
              
              const borderColorMap: Record<string, string> = {
                seedling: "border-orange-200",
                growing: "border-green-200",
                mighty: "border-blue-200",
                elite: "border-amber-200"
              };
              
              return (
                <div
                  key={tierConfig.tier}
                  className={`rounded-2xl bg-gradient-to-r ${tierConfig.bgColor} border ${borderColorMap[tierConfig.tier]} p-3`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{tierConfig.emoji}</div>
                      <div>
                        <div className={`text-display font-bold text-xs ${tierConfig.textColor}`}>
                          {tierConfig.label}
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground">
                          {earnedInTier}/{tierBadges.length} badges unlocked
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${tierConfig.color} transition-all duration-500`}
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Achievement Badges Grid */}
          <div className="mt-6">
            <div className="text-xs font-bold text-muted-foreground mb-3">
              ALL ACHIEVEMENTS
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENT_BADGES.map((badge) => {
                const isUnlocked = badge.unlocked || p.badges.includes(badge.name);
                
                return (
                  <button
                    key={badge.name}
                    onClick={() => {
                      fxTap();
                      setSelectedBadge({ name: badge.name, icon: badge.icon });
                    }}
                    className={`rounded-2xl p-3 flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                      isUnlocked
                        ? `bg-gradient-to-br from-yellow-300 to-yellow-200 border-2 border-yellow-400 shadow-md hover:shadow-lg`
                        : `bg-white border-2 border-gray-200 opacity-60`
                    }`}
                  >
                    <div className="relative mb-1">
                      <div className="text-3xl">{badge.icon}</div>
                      {isUnlocked && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-center line-clamp-2 leading-tight">
                      {badge.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badgeName={selectedBadge.name}
          badgeIcon={selectedBadge.icon}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      <BottomNav active="badges" />
    </div>
  );
}

export function BadgeDetailModal({
  badgeName,
  badgeIcon,
  onClose,
}: {
  badgeName: string;
  badgeIcon: string;
  onClose: () => void;
}) {
  const badge = ACHIEVEMENT_BADGES.find(b => b.name === badgeName);
  
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
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="text-6xl mb-4">{badgeIcon}</div>
          <h2 className="text-display text-2xl font-extrabold">{badgeName}</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-sm">
            {badge?.description || "Unlock this achievement by completing challenges!"}
          </p>
          <button
            onClick={() => {
              fxTap();
              onClose();
            }}
            className="mt-8 h-12 px-6 rounded-2xl gradient-saffron text-white text-display font-bold hover:shadow-lg transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
