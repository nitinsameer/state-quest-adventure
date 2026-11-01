import { useState, useEffect } from "react";
import { fxTap, fxConfetti } from "@/lib/fx";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { AVATAR_CONFIG, type AvatarId, getAvatarBackgroundColor } from "@/lib/avatar-config";
import { EMOJI } from "@/constants/emoji";
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
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden bg-[#87CEEB]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${adventureBg})` }}
      />

      {/* Header Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/15 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="small" />

      {/* Header with Back Button and Step Badge */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg active:scale-95 transition-all"
          >
            <span className="text-xl">‹</span>
          </button>

          {/* Step Badge - Updated to 1/2 */}
          <div className="bg-white rounded-full px-4 py-1 shadow-md">
            <span className="text-xs font-bold text-text-primary">Step 1/2</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-2">
          <div className="text-2xl font-black text-ink">
            Pick Your
            <br />
            <span className="text-4xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent">
              Avatar
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-1">Choose your explorer to start your adventure!</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-safe flex flex-col">
          {/* Avatar Grid - 3 columns with proper spacing */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {AVATAR_IDS.map((avatarId) => (
              <button
                key={avatarId}
                type="button"
                onClick={() => handleAvatarSelect(avatarId)}
                className={`relative aspect-square rounded-3xl overflow-hidden transition-all duration-300 flex items-center justify-center
                  ${animatingId === avatarId ? "avatar-bounce" : ""}
                `}
                style={{
                  backgroundColor: getAvatarBackgroundColor(avatarId),
                  animation:
                    animatingId === avatarId
                      ? "avatar-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      : undefined,
                  boxShadow:
                    selectedAvatar === avatarId
                      ? "0 0 0 5px white, 0 4px 12px rgba(0,0,0,0.15)"
                      : "0 4px 8px rgba(0,0,0,0.1)",
                  transform: selectedAvatar === avatarId ? "scale(1)" : "scale(1)",
                } as React.CSSProperties}
              >
                <img
                  src={getAvatarImage(avatarId)}
                  alt={getAvatarName(avatarId)}
                  className="w-full h-full object-cover"
                />

                {/* Checkmark for Selected */}
                {selectedAvatar === avatarId && (
                  <div className="absolute bottom-1 right-1 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                    <span className="text-lg text-accent-1">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Explorer Summary Card - Bottom Section */}
          {selectedAvatar && (
            <div className="rounded-3xl bg-gradient-to-br from-[#FFFACD] to-[#FFE4B5] p-4 mb-4 shadow-lg animate-fade-in border-2 border-white/80">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarImage(selectedAvatar)}
                  alt={getAvatarName(selectedAvatar)}
                  className="w-16 h-16 rounded-2xl border-3 border-white shadow-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-amber-900 tracking-wider">Your Explorer</div>
                  <div className="text-lg font-black text-ink truncate">{getAvatarName(selectedAvatar)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          {selectedAvatar && (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Continue
              <span>→</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes avatar-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
