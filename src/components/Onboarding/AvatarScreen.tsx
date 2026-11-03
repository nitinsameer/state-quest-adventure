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
    <div className="w-full h-full flex flex-col select-none touch-none relative overflow-hidden">
      {/* Background Image - Full Screen */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url(${adventureBg})`,
          backgroundPosition: "center top",
          backgroundSize: "cover"
        }}
      />

      {/* Subtle overlay for text readability at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent z-5" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent z-5" />

      <ConfettiBurst trigger={confettiBurst} size="small" />

      {/* Header Section - Fixed at Top */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-2 pb-2">
        {/* Back Button + Step Badge Row */}
        <div className="flex items-center justify-between mb-2">
          {/* Back Button - White Circle */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg active:scale-95 transition-all flex-shrink-0"
            aria-label="Go back"
          >
            <span className="text-lg font-black text-ink">&lt;</span>
          </button>

          {/* Step Badge - White Pill */}
          <div className="bg-white rounded-full px-3 py-1 shadow-md">
            <span className="text-xs font-black text-ink" style={{ fontFamily: "var(--font-display)" }}>Step 1/3</span>
          </div>
        </div>

        {/* Title Section - Premium Styling with Custom Fonts */}
        <div className="text-center">
          {/* Main Heading - "Pick Your" */}
          <div 
            className="text-3xl leading-tight font-black"
            style={{ 
              fontFamily: "var(--font-display)",
              color: "#1a2e4a",
              fontWeight: 900,
              letterSpacing: "-0.02em"
            }}
          >
            Pick Your
          </div>
          
          {/* Avatar Text with Golden Gradient - "Avatar" */}
          <div 
            className="text-6xl font-black leading-tight mt-0 mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              background: "linear-gradient(to right, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Avatar
          </div>

          {/* Subtitle */}
          <p 
            className="text-sm text-ink font-semibold leading-snug"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Choose your explorer to start your adventure!
          </p>
        </div>
      </div>

      {/* Main Content Container - Scrollable Avatar Grid + Fixed Footer */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Avatar Grid Section */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Avatar Grid - 3 Columns */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {AVATAR_IDS.map((avatarId) => (
              <button
                key={avatarId}
                type="button"
                onClick={() => handleAvatarSelect(avatarId)}
                className="relative aspect-square rounded-3xl overflow-hidden transition-all duration-300 flex items-center justify-center focus:outline-none active:scale-95"
                aria-label={`Select ${getAvatarName(avatarId)}`}
                style={{
                  backgroundColor: getAvatarBackgroundColor(avatarId),
                  boxShadow:
                    selectedAvatar === avatarId
                      ? "0 0 0 4px white, 0 0 0 6px #FFD700, 0 8px 16px rgba(0,0,0,0.2)"
                      : "0 4px 12px rgba(0,0,0,0.15)",
                  transform: selectedAvatar === avatarId ? "scale(1.02)" : "scale(1)",
                } as React.CSSProperties}
              >
                {/* Avatar Image */}
                <img
                  src={getAvatarImage(avatarId)}
                  alt={getAvatarName(avatarId)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Selected Checkmark Badge - Bottom Right */}
                {selectedAvatar === avatarId && (
                  <div
                    className="absolute bottom-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white"
                    style={{
                      animation: "scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <span className="text-base font-black" style={{ color: "#6366F1" }}>
                      ✓
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Footer Section - Always Visible */}
        <div className="flex-shrink-0 relative z-20 bg-gradient-to-t from-black/5 to-transparent px-4 py-3 pb-safe">
          {/* Explorer Summary Card */}
          {selectedAvatar && (
            <div
              className="rounded-3xl p-4 mb-3 shadow-lg border-2 border-white/80"
              style={{
                background: "linear-gradient(135deg, #FFFACD 0%, #FFE4B5 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar Thumbnail */}
                <img
                  src={getAvatarImage(selectedAvatar)}
                  alt={getAvatarName(selectedAvatar)}
                  className="w-14 h-14 rounded-2xl border-3 border-white shadow-md flex-shrink-0 object-cover"
                />

                {/* Explorer Info */}
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-xs font-black text-amber-900 tracking-wider"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    YOUR EXPLORER
                  </div>
                  <div 
                    className="text-lg font-black text-ink truncate"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {getAvatarName(selectedAvatar)}
                  </div>
                </div>

                {/* Compass Icon */}
                <div className="text-2xl flex-shrink-0">
                  🧭
                </div>
              </div>
            </div>
          )}

          {/* Continue Button - Always Visible */}
          {selectedAvatar && (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#7650F5] to-[#6366F1] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
              aria-label="Continue to next step"
            >
              <span>Continue</span>
              <span className="text-lg">→</span>
            </button>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.6);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scale-in,
          .animate-fade-in-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
