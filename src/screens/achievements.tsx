// Achievements screen

import { useGoBack, BottomNav, HeaderBar } from "./shared";
import { useProgress, achievementBadgesFor } from "@/lib/progress";

export function AchievementsScreen() {
  const p = useProgress();
  const goBack = useGoBack();
  const achievements = achievementBadgesFor(p);

  return (
    <div className="h-full w-full bg-white flex flex-col">
      <HeaderBar title="Achievements" onBack={true} />
      
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-display text-2xl font-extrabold">Special Achievements</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Unlock special achievements by reaching milestones
          </p>
        </div>

        {/* Achievements List */}
        <div className="space-y-3">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl flex-shrink-0">👑</div>
                <div className="flex-1">
                  <div className="font-extrabold">{achievement.name}</div>
                  <div className="text-xs opacity-90">{achievement.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm text-muted-foreground">
              Complete more states to unlock achievements!
            </p>
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
