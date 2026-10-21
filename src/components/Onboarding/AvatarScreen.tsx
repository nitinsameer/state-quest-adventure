import { useState, useEffect } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { AVATAR_CONFIG, type AvatarId, getAvatarBackgroundColor } from "@/lib/avatar-config";
import { PremiumHeader } from "./PremiumHeader";
import adventureBg from "@/assets/avatar_adventure_bg.png";
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

export function AvatarScreen({ selectedAvatar, onSelectAvatar, onNext }: AvatarScreenProps) {
  const [confettiBurst, setConfettiBurst] = useState(0);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Set default avatar on mount
  useEffect(() => {
    if (!selectedAvatar) {
      onSelectAvatar("explorer-hat");
    }
  }, []);

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
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden bg-bg-page">
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-top z-0"
        style={{ backgroundImage: `url(${adventureBg})`, backgroundPosition: "center top" }}
      />

      {/* Subtle overlay only in header area for text readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 via-black/10 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="small" />

      {/* Premium Header - Fixed */}
      <div className="relative z-10 flex-shrink-0">
        <PremiumHeader
          firstPart="Pick Your"
          secondPart="Avatar"
          subtitle="Choose your explorer to start your adventure!"
          step={1}
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col">
        {/* Inner wrapper for content with padding */}
        <div className="px-4 py-3 flex flex-col">
          {/* Avatar Grid - 3 columns */}
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_IDS.map((avatarId) => (
              <button
                key={avatarId}
                type="button"
                onClick={() => handleAvatarSelect(avatarId)}
                className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center group
                  ${
                    selectedAvatar === avatarId
                      ? "ring-6 ring-white shadow-elevated-2 scale-110"
                      : "ring-3 ring-white shadow-sm hover:shadow-lg"
                  }
                  ${animatingId === avatarId ? "avatar-bounce" : ""}
                `}
                style={{
                  backgroundColor: getAvatarBackgroundColor(avatarId),
                  animation:
                    animatingId === avatarId
                      ? "avatar-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      : undefined,
                } as React.CSSProperties}
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

          {/* Preview Card - Scrolls with content */}
          {selectedAvatar && (
            <div className="mt-1 rounded-xl bg-yellow-100 p-3 text-text-primary shadow-elevated-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <img
                  src={getAvatarImage(selectedAvatar)}
                  alt={getAvatarName(selectedAvatar)}
                  className="w-12 h-12 rounded-full border-2 border-text-primary shadow-elevated-2 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs opacity-80 font-semibold">YOUR EXPLORER</div>
                  <div className="text-sm font-black truncate text-text-primary">{getAvatarName(selectedAvatar)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Next button - Scrolls with content */}
      <div className="relative z-10 px-5 py-1 bg-surface-card border-t border-border-color pb-safe">
        <button
          type="button"
          onClick={handleNext}
          disabled={!selectedAvatar}
          className={`w-full py-2 px-4 rounded-xl font-bold transition-colors text-sm ${
            selectedAvatar
              ? "bg-action-primary text-text-on-primary hover:shadow-elevated-1"
              : "bg-surface-sunken text-text-secondary cursor-not-allowed opacity-50"
          }`}
        >
          Continue
        </button>
      </div>

      <style>{`
        @keyframes avatar-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
