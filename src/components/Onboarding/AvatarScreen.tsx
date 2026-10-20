import { useState, useEffect } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { AVATAR_CONFIG, type AvatarId } from "@/lib/avatar-config";
import avatarExplorerHat from "@/assets/avatars/avatar-explorer-hat.png";
import avatarExplorerPink from "@/assets/avatars/avatar-explorer-pink.png";
import avatarGeekGlasses from "@/assets/avatars/avatar-geek-glasses.png";
import avatarGirlPeace from "@/assets/avatars/avatar-girl-peace.png";
import avatarTurbanRed from "@/assets/avatars/avatar-turban-red.png";
import avatarGirlEarring from "@/assets/avatars/avatar-girl-earring.png";
import avatarBoySmi from "@/assets/avatars/avatar-boy-smile.png";
import avatarGirlTikka from "@/assets/avatars/avatar-girl-tikka.png";
import avatarSkiGoggles from "@/assets/avatars/avatar-ski-goggles.png";
import avatarFarmerHat from "@/assets/avatars/avatar-farmer-hat.png";
import avatarSportsCap from "@/assets/avatars/avatar-sports-cap.png";
import avatarGirlFlower from "@/assets/avatars/avatar-girl-flower.png";


const AVATAR_IMAGE_MAP: Record<AvatarId, string> = {
  "explorer-hat": avatarExplorerHat,
  "explorer-pink": avatarExplorerPink,
  "geek-glasses": avatarGeekGlasses,
  "girl-peace": avatarGirlPeace,
  "turban-red": avatarTurbanRed,
  "girl-earring": avatarGirlEarring,
  "boy-smile": avatarBoySmi,
  "girl-tikka": avatarGirlTikka,
  "ski-goggles": avatarSkiGoggles,
  "farmer-hat": avatarFarmerHat,
  "sports-cap": avatarSportsCap,
  "girl-flower": avatarGirlFlower,
};

const AVATAR_IDS: AvatarId[] = [
  "explorer-hat",
  "explorer-pink",
  "geek-glasses",
  "girl-peace",
  "turban-red",
  "girl-earring",
  "boy-smile",
  "girl-tikka",
  "ski-goggles",
  "farmer-hat",
  "sports-cap",
  "girl-flower",
];

function getAvatarName(avatarId: string): string {
  if (!avatarId) return "Explorer";
  return AVATAR_CONFIG[avatarId as AvatarId]?.name || "Explorer";
}

function getAvatarImage(avatarId: string): string {
  if (!avatarId) return avatarExplorerHat;
  return AVATAR_IMAGE_MAP[avatarId as AvatarId] || avatarExplorerHat;
}

export interface AvatarScreenProps {
  selectedAvatar: string | null;
  onSelectAvatar: (avatarId: string) => void;
  onNext: () => void;
}

export function AvatarScreen({
  selectedAvatar,
  onSelectAvatar,
  onNext,
}: AvatarScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleAvatarSelect = (avatarId: AvatarId) => {
    // Play tap sound
    fxTap();

    // Play confetti and small animation
    fxConfetti();
    setConfettiBurst((n) => n + 1);

    // Trigger bounce animation
    setAnimatingId(avatarId);
    setTimeout(() => setAnimatingId(null), 400);

    // Update selected avatar
    onSelectAvatar(avatarId);
  };

  const handleNext = () => {
    if (!selectedAvatar) return;
    fxTap();
    onNext();
  };

  return (
    <div className="w-full h-full bg-accent-1-soft flex flex-col select-none touch-none relative overflow-hidden animate-screen-enter-right">
      <ConfettiBurst trigger={confettiBurst} size="small" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 bg-accent-1 text-text-on-primary animate-slide-in-left animate-delay-100 flex-shrink-0">
        <h1 className="text-2xl font-black">✨ Pick Your Explorer</h1>
        <p className="text-xs opacity-90 mt-0.5">Choose the guide who'll discover India with you</p>
      </div>

      {/* Content - Scrollable if needed */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {/* Avatar Grid - 4 columns, compact */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {AVATAR_IDS.map((avatarId) => (
            <button
              key={avatarId}
              type="button"
              onClick={() => handleAvatarSelect(avatarId)}
              className={`relative w-14 h-14 rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center group
                ${
                  selectedAvatar === avatarId
                    ? "ring-4 ring-accent-4 shadow-elevated-1 animate-avatar-ring-glow"
                    : "ring-2 ring-border-color shadow-sm opacity-75 hover:opacity-100"
                }
                ${animatingId === avatarId ? "animate-avatar-bounce" : ""}
              `}
            >
              <img
                src={getAvatarImage(avatarId)}
                alt={getAvatarName(avatarId)}
                className="w-full h-full object-cover"
              />
              {/* Glow effect for selected */}
              {selectedAvatar === avatarId && (
                <div className="absolute inset-0 bg-accent-4 opacity-10 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Preview Card - Compact */}
        {selectedAvatar && (
          <div className="rounded-xl bg-action-primary p-2 text-text-on-primary shadow-elevated-1 animate-fade-in">
            <div className="flex items-center gap-2">
              <img
                src={getAvatarImage(selectedAvatar)}
                alt={getAvatarName(selectedAvatar)}
                className="w-8 h-8 rounded-full border-2 border-text-on-primary shadow-elevated-1 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs opacity-90 font-semibold">Your explorer!</div>
                <div className="text-sm font-black truncate">{getAvatarName(selectedAvatar)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Next button only */}
      <div className="px-5 py-2 bg-surface-card border-t border-border-color flex-shrink-0 pb-safe">
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedAvatar}
          className={`w-full h-12 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            selectedAvatar
              ? "bg-action-primary text-text-on-primary hover:shadow-elevated-2 active:scale-95"
              : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
          }`}
        >
          <span>Next</span>
          <span className={selectedAvatar ? "opacity-100" : "opacity-50"}>→</span>
        </button>
      </div>

      <style>{`
        /* Keep minimal style for component specifics only */
      `}</style>
    </div>
  );
}
